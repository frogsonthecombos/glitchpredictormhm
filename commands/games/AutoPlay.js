const CustomCommand = require('../../classes/CustomCommand');
const cloudscraper = require('cloudscraper');
const petitio = require('petitio');
const { stripIndent } = require('common-tags');

class AutoPlayCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'autoplay',
            group: 'games',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Autoplays a game for you on Bloxflip.',
            licensedOnly: true,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'mines',
                description: 'Autoplays mines for you.',
                options: [{
                    type: 10,
                    name: 'bet',
                    minValue: 5,
                    maxValue: 1000,
                    description: 'How much would you like to bet?',
                    required: true
                }, {
                    type: 10,
                    name: 'mines',
                    minValue: 1,
                    maxValue: 24,
                    description: 'How many mines would you like to play with?',
                    required: true
                }, {
                    type: 10,
                    name: 'spots',
                    minValue: 1,
                    maxValue: 6,
                    description: 'How many spots would you like to be interacted with?',
                    required: true
                }]
            }]
        });
    };

    async exec(i) {
        const bet = i.options.getNumber('bet');
        const mines = i.options.getNumber('mines');
        const spots = i.options.getNumber('spots');
        const { bloxFlipToken } = await this.utility.getCustomProfile(i.user.id);

        await cloudscraper.get({
            uri: 'https://api.bloxflip.com/user',
            headers: { 'x-auth-token': bloxFlipToken },
        }).then(async userRes => {
            const bloxUser = JSON.parse(userRes);
            const wallet = bloxUser.user.wallet;

            if (wallet < bet) return i.editReply(`⚠️ With a balance of about \`$${Math.round(10 * wallet) / 10}\`, you don\'t have enough to bet that much.`);

            await cloudscraper.post({
                uri: 'https://api.bloxflip.com/games/mines/create',
                headers: { 'x-auth-token': bloxFlipToken },
                json: { betAmount: bet, mines: mines }
            }).then(async info => {
                const plutonRes = await petitio(`https://pluton-app.herokuapp.com/v4/mines/${info.game.serverHash}`).send();
                const prediction = plutonRes.json();
                let gameOver = false;
                let exploded = false;

                await i.editReply(`🌀 Now interacting with \`${spots}\` spots...`);

                while (!gameOver) {
                    for (let a = 0; a < spots; a++) {
                        await cloudscraper.post({
                            uri: 'https://api.bloxflip.com/games/mines/action',
                            headers: { 'x-auth-token': bloxFlipToken },
                            json: { mine: prediction.possible_spots[a], cashout: false }
                        }).then(async action => {
                            if (action.exploded) {
                                exploded = true;
                                gameOver = true;
                            };
                        }).catch(() => { });

                        if (a === (spots - 1)) gameOver = true;
                        if (!gameOver) await new Promise(r => setTimeout(r, 200));
                    };
                };

                if (exploded) return i.editReply(`💣 Kaboom! Sorry, but this game has been lost, leaving you at about \`$${Math.round(10 * (wallet - bet)) / 10}\`.`);

                await i.editReply({
                    content: '💰 Game won! Want me to cashout your winnings?',
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: 'cashout',
                            label: 'Yes Please',
                            style: 3
                        }, {
                            type: 2,
                            customId: 'cancel',
                            label: 'No Thanks',
                            style: 4
                        }]
                    }]
                });

                const collector = (await i.fetchReply()).createMessageComponentCollector({
                    filter: ii => ii.user.id === i.user.id,
                    time: 30_000, dipose: true
                });

                collector.on('collect', async (button) => {
                    await button.deferUpdate();

                    if (button.customId === 'cashout') {
                        const cashout = await cloudscraper.post({
                            uri: 'https://api.bloxflip.com/games/mines/action',
                            headers: { 'x-auth-token': bloxFlipToken },
                            json: { cashout: true }
                        });

                        await button.editReply({
                            content: `💰 Okay, your balance has been updated to \`$${Math.round(10 * (wallet - bet + cashout.winnings)) / 10}\`!`,
                            components: []
                        });
                    } else {
                        await button.editReply({
                            content: '❌ Okay, cashout cancelled. Enjoy the rest of your game, and good luck!',
                            components: []
                        });
                    };

                    collector.stop();
                });
            }).catch(async () => await i.editReply('⚠️ You already have a game running.'));
        }).catch(async () => await i.editReply('⚠️ No Bloxflip token set.'))
    };
};

module.exports = AutoPlayCommand;