const CustomCommand = require('../../classes/CustomCommand');

class ReloadCoresCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'reloadcores',
            group: 'owner',
            ownerOnly: false,
            coreOwnerOnly: true,
            useEphemeral: false,
            description: 'Reloads core components.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        this.itemRegistry.decache();
        await this.itemRegistry.loadEvents();
        await this.itemRegistry.loadCommands();

        await i.editReply('👨‍🔬 Core components reloaded.');
    };
};

module.exports = ReloadCoresCommand;