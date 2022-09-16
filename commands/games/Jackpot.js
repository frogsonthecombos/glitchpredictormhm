const CustomCommand = require('../../classes/CustomCommand');
const { stripIndents } = require('common-tags');
const petitio = require('petitio');

class JackpotCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'jackpot',
            group: 'games',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Gives information on the jackpot gamemode.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const request = await petitio("https://pluton-app.herokuapp.com/v4/jackpot").send();
        const data = request.json();

        if (!data) return i.editReply('⚠ Unable to get jackpot data. Please retry.');

        await i.editReply({
            embeds: [{
                color: 0x5288fb,
                title: '🎯 Jackpot',
                description: stripIndents(`
                    \`・\` Fairness: **${Math.round(data.fairness + (data.fairness < 0 ? 0 : -1 - 15))}%**
                    \`・\` Average: **${data.lastWin[0] || 'N/A'}**
                `)
            }]
        });
    };
};



module.exports = JackpotCommand;