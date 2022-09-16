const CustomCommand = require('../../classes/CustomCommand');

class ManagersCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'managers',
            group: 'owner',
            ownerOnly: true,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Edits the managers registry.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'registry',
                description: 'Lists all managers in the registry.'
            }, {
                type: 1,
                name: 'employ',
                description: 'Employs a manager.',
                options: [{
                    type: 6,
                    name: 'user',
                    description: 'Who would you like to employ as a manager?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'unemploy',
                description: 'Unemploys a manager.',
                options: [{
                    type: 6,
                    name: 'user',
                    description: 'Who would you like to unemploy as a manager?',
                    required: true
                }]
            }]
        });
    };

    async exec(i) {
        const user = i.options.getUser('user', false);
        const mongo = await this.utility.getMongoData();

        switch (i.options.getSubcommand()) {
            case 'registry':
                await i.editReply({
                    embeds: [{
                        color: 0x5288fb,
                        title: '🧑‍🏭 Manager Registry',
                        description: mongo.managerRegistry.length
                            ? mongo.managerRegistry.map(m => {
                                const get = this.bot.users.cache.get(m);

                                return `\`・\` **${get ? get.tag : '???'}**`;
                            }).join('\n')
                            : 'No managers registered so far.'
                    }]
                });

                break;
            case 'employ':
                if (!mongo.managerRegistry.includes(user.id)) {
                    await this.globalMongo.findOneAndUpdate({}, {
                        $push: { managerRegistry: user.id }
                    });
                };

                await i.editReply('🧑‍🏭 Manager employed.');

                break;
            case 'unemploy':
                await this.globalMongo.findOneAndUpdate({}, {
                    $pull: { managerRegistry: user.id }
                });

                await i.editReply('🧑‍🏭 Manager unemployed.');
        };
    };
};

module.exports = ManagersCommand;