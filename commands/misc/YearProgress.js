const CustomCommand = require('../../classes/CustomCommand');

class YearProgressCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'yearprogress',
            group: 'misc',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends this year\'s current progress.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const today = new Date();
        const thisYear = new Date(today.getFullYear(), 0, 1);
        const nextYear = new Date(today.getFullYear() + 1, 0, 1);

        await i.editReply(`🗓️ This year is \`${Math.round((Math.abs(today - thisYear) / Math.abs(nextYear - thisYear)) * 100)}%\` finished.`);
    };
};

module.exports = YearProgressCommand;