const CustomCommand = require('../../classes/CustomCommand');
const { stripIndents } = require('common-tags');
const petitio = require('petitio');

class CrashCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'crash',
            group: 'games',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Estimates the crashpoints, and other details.',
            licensedOnly: true,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const request = await petitio("https://pluton-app.herokuapp.com/v4/crash").send();
        const data = request.json();

        if (!data) return i.editReply('⚠ Unable to get crash data. Please retry.');

        await i.editReply({
            embeds: [{
                color: 0x5288fb,
                title: '📈 Crash',
                description: stripIndents(`
                    \`・\` Estimation: **${data.averageCrashpoint + (data.averageCrashpoint < 1 ? 1 : 0)}x**
                    \`・\` Potential: **${data.potentialCrashpoint + (data.potentialCrashpoint < 1 ? 1 : 0)}x**
                    \`・\` Last Crashpoint: **${data.lastCrashpoint + (data.lastCrashpoint < 1 ? 1 : 0)}x** 
                `)
            }]
        });
    };
};



module.exports = CrashCommand;