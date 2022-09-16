const CustomCommand = require('../../classes/CustomCommand');
const { stripIndents } = require('common-tags');

class InternalSettingsCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'internalsettings',
            group: 'owner',
            ownerOnly: true,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Edits the internal settings.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'show',
                description: 'Shows the current internal settings.'
            }, {
                type: 1,
                name: 'allowchannel',
                description: 'Allows a channel to have predictions executed in it.',
                options: [{
                    type: 7,
                    name: 'channel',
                    description: 'What channel would you like to allow?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'denychannel',
                description: 'Denies a channel to have predictions executed in it.',
                options: [{
                    type: 7,
                    name: 'channel',
                    description: 'What channel would you like to deny?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'setcrashchannel',
                description: 'Sets the channel for automatic crash points to go to.',
                options: [{
                    type: 7,
                    name: 'channel',
                    description: 'What channel would you like crash points to go to?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'setcustomerrole',
                description: 'Sets the role to be given to new customers.',
                options: [{
                    type: 8,
                    name: 'role',
                    description: 'What role would you like to go to new customers?',
                    required: true
                }]
            }]
        });
    };

    async exec(i) {
        const mongo = await this.utility.getMongoData();
        const channel = i.options.getChannel('channel', false);
        const role = i.options.getRole('role', false);

        switch (i.options.getSubcommand()) {
            case 'show':
                await i.editReply({
                    embeds: [{
                        color: 0x5288fb,
                        title: '🔎 Internal Settings',
                        description: mongo.permittedPredictionChannels.length
                            ? stripIndents(`
                                Showing all allowed prediction channels.

                                ${mongo.permittedPredictionChannels.map(p => `\`・\` <#${p}>`).join('\n')}
                            `)
                            : 'No prediction channels allowed so far.'
                    }]
                });

                break;
            case 'allowchannel':
                if (!mongo.permittedPredictionChannels.includes(channel.id)) {
                    await this.globalMongo.findOneAndUpdate({}, {
                        $push: { permittedPredictionChannels: channel.id }
                    });
                };

                await i.editReply('🔎 Channel now allowed to contain predictions.');

                break;
            case 'denychannel':
                await this.globalMongo.findOneAndUpdate({}, {
                    $pull: { permittedPredictionChannels: channel.id }
                });

                await i.editReply('🔎 Channel no longer allowed to contain predictions.');

                break;
            case 'setcrashchannel':
                await this.globalMongo.findOneAndUpdate({}, {
                    crashPointChannel: channel.id
                });

                await i.editReply('🔎 Channel now set to receive automatic crash points.');

                break;

            case 'setcustomerrole':
                await this.globalMongo.findOneAndUpdate({}, {
                    customerRole: role.id
                });

                await i.editReply('🔎 Role now set to be given to new customers.');

                break;
        };
    };
};

module.exports = InternalSettingsCommand;