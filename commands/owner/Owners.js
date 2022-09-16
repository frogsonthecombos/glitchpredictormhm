const CustomCommand = require('../../classes/CustomCommand');

class OwnersCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'owners',
            group: 'owner',
            ownerOnly: false,
            coreOwnerOnly: true,
            description: 'Edits the owners registry.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'registry',
                description: 'Lists all owners in the registry.'
            }, {
                type: 1,
                name: 'employ',
                description: 'Employs an owner.',
                options: [{
                    type: 6,
                    name: 'user',
                    description: 'Who would you like to employ as an owner?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'unemploy',
                description: 'Unemploys an owner.',
                options: [{
                    type: 6,
                    name: 'user',
                    description: 'Who would you like to unemploy as an owner?',
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
                        title: '🧑‍💼 Owner Registry',
                        description: mongo.ownerRegistry.length
                            ? mongo.ownerRegistry.map(m => {
                                const get = this.bot.users.cache.get(m);

                                return `\`・\` **${get ? get.tag : '???'}**`;
                            }).join('\n')
                            : 'No owners registered so far.'
                    }]
                });

                break;
            case 'employ':
                if (!mongo.ownerRegistry.includes(user.id)) {
                    await this.globalMongo.findOneAndUpdate({}, {
                        $push: { ownerRegistry: user.id }
                    });
                };

                await i.editReply('🧑‍💼 Owner employed.');

                break;
            case 'unemploy':
                await this.globalMongo.findOneAndUpdate({}, {
                    $pull: { ownerRegistry: user.id }
                });

                await i.editReply('🧑‍💼 Owner unemployed.');
        };
    };
};

module.exports = OwnersCommand;