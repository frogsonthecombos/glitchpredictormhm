const CustomCommand = require('../../classes/CustomCommand');

class PingCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'ping',
            group: 'utility',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends my ping.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        await i.reply(`🌡️ My ping is \`${this.bot.ws.ping}ms\`!`);
    };
};

module.exports = PingCommand;