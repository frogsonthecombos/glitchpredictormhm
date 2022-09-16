const CustomEvent = require('../../classes/CustomEvent');

class InteractionCreateEvent extends CustomEvent {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'interactionCreate',
            occursOnce: false
        });

        this.cooldowns = {};
    };

    async exec(i) {
        if ((!i.replied && !i.deferred) && i.isCommand()) {
            const command = this.itemRegistry.commands.get(i.commandName);

            await i.deferReply({ ephemeral: !!command.useEphemeral });

            await this.utility.makeCustomProfile(i.user.id);

            const profile = await this.utility.getCustomProfile(i.user.id);
            const mongo = await this.utility.getMongoData();

            if (command.ownerOnly && !process.env.owners.includes(i.user.id) && !mongo.ownerRegistry.includes(i.user.id)) return i.editReply({ content: '🔒 This is an owner command!', ephemeral: true });
            if (command.coreOwnerOnly && !process.env.owners.includes(i.user.id)) return i.editReply({ content: '🔒 This is a core owner command!', ephemeral: true });
            if (command.licensedOnly && profile.licensedSince === 0) return i.editReply({ content: '🔒 This is a licensed command!', ephemeral: true });
            if (command.group === 'games') {
                if (!mongo.permittedPredictionChannels.includes(i.channel.id)) return i.editReply({ content: '🔒 This channel doesn\'t allow predictions!', ephemeral: true });

                if (profile.licensedOnly === 0) {
                    const cooldown = this.cooldowns[i.user.id];

                    if (cooldown) {
                        const secs = (Date.now() - cooldown) / 1000;

                        if (secs < (4 * 60)) return i.editReply({ content: `⏰ You're on cooldown for \`${ms((5 * 60 * 1000) - (secs * 1000))}\`!`, ephemeral: true });

                        delete this.cooldowns[i.user.id];
                    };
                };
            };

            if (command.managerOnly && !process.env.owners.includes(i.user.id) && !mongo.ownerRegistry.includes(i.user.id) && !mongo.managerRegistry.includes(i.user.id)) return i.editReply({ content: '🔒 This is a manager command!', ephemeral: true });

            await command.exec(i).catch(console.log);
        };
    };
};

module.exports = InteractionCreateEvent;