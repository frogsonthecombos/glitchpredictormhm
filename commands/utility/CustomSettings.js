const CustomCommand = require('../../classes/CustomCommand');
const cloudscraper = require('cloudscraper');
const petitio = require('petitio');

class CustomSettingsCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'customsettings',
            group: 'utility',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: true,
            description: 'Allows you to configure your custom settings.',
            licensedOnly: true,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'setbloxtoken',
                description: 'Sets your Bloxflip token.',
                options: [{
                    type: 3,
                    name: 'token',
                    description: 'What would you like to set your token as?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'setrobloxid',
                description: 'Sets your Roblox ID.',
                options: [{
                    type: 10,
                    name: 'id',
                    description: 'What would you like to set your ID as?',
                    required: true
                }]
            }]
        });
    };

    async exec(i) {
        const token = i.options.getString('token', false);
        const id = i.options.getNumber('id', false);

        switch (i.options.getSubcommand()) {
            case 'setbloxtoken':
                await cloudscraper.get({
                    uri: 'https://api.bloxflip.com/user',
                    headers: { 'x-auth-token': token },
                }).then(async res => {
                    const data = JSON.parse(res);

                    await this.utility.updateCustomProfile(
                        i.user.id,
                        'bloxFlipToken',
                        token
                    );

                    await i.editReply(`⚙️ Bloxflip token set. Welcome, \`@${data.user.robloxUsername}\`.`);
                }).catch(async () => await i.editReply('⚠️ Invalid token provided.'));

                break;
            case 'setrobloxid':
                const rblxString = this.utility.genRobloxString();
                const test = await petitio(`https://users.roblox.com/v1/users/${id}`);
                const testRes = test.json();

                if (testRes.errors || testRes.isBanned) return i.editReply('⚠️ Invalid ID provided.');

                await i.editReply({
                    content: `Attach this text to your **Roblox** bio:\n📝 \`${rblxString}\``,
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: 'done',
                            label: 'Done',
                            style: 3
                        }, {
                            type: 2,
                            customId: 'cancel',
                            label: 'Cancel',
                            style: 4
                        }]
                    }]
                });

                const collector = (await i.fetchReply()).createMessageComponentCollector({
                    filter: ii => ii.user.id === i.user.id,
                    time: 120_000, dipose: true
                });

                collector.on('collect', async (button) => {
                    await button.deferUpdate();

                    const req = await petitio(`https://users.roblox.com/v1/users/${id}`).send();
                    const res = req.json();

                    if (button.customId === 'done') {
                        if (res.description.includes(rblxString)) {
                            await this.utility.updateCustomProfile(
                                i.user.id,
                                'robloxUserId',
                                id
                            );

                            await i.editReply({
                                content: `⚙️ Roblox ID set. Welcome, \`@${res.name}\`.`,
                                components: []
                            });
                        } else {
                            await i.editReply({
                                content: '⚠️ Text not found in bio, please retry.',
                                components: []
                            });
                        };
                    } else {
                        await button.editReply({
                            content: '❌ Okay, bio verification cancelled.',
                            components: []
                        });
                    };

                    collector.stop();
                });

                break;
        };
    };
};

module.exports = CustomSettingsCommand;