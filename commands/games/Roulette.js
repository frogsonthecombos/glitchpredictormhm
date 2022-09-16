const CustomCommand = require('../../classes/CustomCommand');
const { stripIndents } = require('common-tags');
const petitio = require('petitio');

class RouletteCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'roulette',
            group: 'games',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Estimates roulette, and other details.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const request = await petitio("https://pluton-app.herokuapp.com/v4/roulette").send();
        const data = request.json();
        let estimationEmoji = '';
        let averageEmoji = '';

        if (!data) return i.editReply('⚠ Unable to get roulette data. Please retry.');

        switch (data.rouletteEstimation) {
            case 'yellow': estimationEmoji = '🟡'; break;
            case 'purple': estimationEmoji = '🟣'; break;
            case 'red': estimationEmoji = '🔴';
        };

        switch (data.rouletteAverage[0]) {
            case 'yellow': averageEmoji = '🟡'; break;
            case 'purple': averageEmoji = '🟣'; break;
            case 'red': averageEmoji = '🔴';
        };

        await i.editReply({
            embeds: [{
                color: 0x5288fb,
                title: '🎰 Roulette',
                description: stripIndents(`
                    \`・\` Estimation: **${this.utility.capitalize(data.rouletteEstimation)}** ${estimationEmoji}
                    \`・\` Average: **${this.utility.capitalize(data.rouletteAverage[0])}** ${averageEmoji}
                    \`・\` Accuracy: **${data.rouletteAccuracy}%**          
                    \`・\` Game Started: **${data.gameStarted[0] ? 'Yes' : 'No'}**
                `)
            }]
        });
    };
};



module.exports = RouletteCommand;