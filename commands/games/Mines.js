const CustomCommand = require('../../classes/CustomCommand');
const petitio = require('petitio');

class MinesCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'mines',
            group: 'games',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends a 6-spot mines prediction.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 3,
                name: 'serverhash',
                description: 'What is the server hash of your mines game?',
                required: true
            }]
        });
    };

    async exec(i) {
        const profile = await this.utility.getCustomProfile(i.user.id);
        const mongo = await this.utility.getMongoData();
        const hash = i.options.getString('serverhash');
        const grid = Array.from(Array(25)).map(() => '🌀');

        await petitio(`https://pluton-app.herokuapp.com/v4/mines/${hash}`).send().then(async plutonRes => {
            const prediction = plutonRes.json();

            if (!prediction.possible_spots.some(s => s !== 0)) return i.editReply('⚠️ Invalid server-hash provided.');
    
            if (profile.licensedSince === 0) {
                for (let a = 0; a < 6; a++) {
                    grid[Math.floor(Math.random() * 25)] = '⭐';
                };
    
                await i.editReply({
                    embeds: [{
                        color: 0xD738FF,
                        title: '🔎 Non-licensed Mines Prediction',
                        description: grid.map((m, i) => {
                            if ([4, 9, 14, 19, 24].includes(i)) return `${m}\n`;
    
                            return m;
                        }).join('')
                    }],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            label: 'License Pricing',
                            url: 'https://nekokouri.gitbook.io/glitch/pricing',
                            style: 5
                        }]
                    }]
                });
            } else {
                for (let a = 0; a < 6; a++) {
                    grid[prediction.possible_spots[a]] = '⭐';
                };
    
                await i.editReply({
                    embeds: [{
                        color: 0xD738FF,
                        title: '🔎 Licensed Mines Prediction',
                        description: grid.map((m, i) => {
                            if ([4, 9, 14, 19, 24].includes(i)) return `${m}\n`;
    
                            return m;
                        }).join('')
                    }]
                });
            };
    
            await this.globalMongo.findOneAndUpdate({}, {
                serverHashCombo: `${mongo.serverHashCombo}|${hash}`
            });
        }).catch(async () => await i.editReply('⚠️ Invalid server-hash provided.'));
    };
};

module.exports = MinesCommand;