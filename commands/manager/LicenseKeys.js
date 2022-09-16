const CustomCommand = require('../../classes/CustomCommand');
const ms = require('ms');
const { promisify } = require('util');

class LicenseKeysCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'licensekeys',
            group: 'manager',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Edits the inactive license key item-space.',
            licensedOnly: false,
            managerOnly: true,
            options: [{
                type: 1,
                name: 'create',
                description: 'Creates a new license key.',
                options: [{
                    type: 3,
                    name: 'duration',
                    description: 'How long would you like the subscription to last (7d, 30d, etc.)?',
                    required: true
                }, {
                    type: 6,
                    name: 'user',
                    description: 'Who would you like to assign the key to?',
                    required: true
                }]
            }, {
                type: 1,
                name: 'void',
                description: 'Voids all inactive license keys.'
            }]
        });
    };

    async exec(i) {
        const key = this.utility.genRandomString(10);
        const duration = i.options.getString('duration', false);
        const user = i.options.getUser('user', false);

        switch (i.options.getSubcommand()) {
            case 'create':
                try { ms(duration) } catch { return i.editReply('⚠️ Invalid duration provided.'); };

                if (!ms(duration)) return i.editReply('⚠️ Invalid duration provided.');

                await this.globalMongo.findOneAndUpdate({}, {
                    $push: {
                        inactiveLicenseKeys: {
                            key: key,
                            duration: ms(duration),
                            owner: user.id
                        }
                    }
                });

                await i.editReply(`Inactive license key created:\n🗒️ \`${key}\``);

                break;
            case 'void':
                await this.globalMongo.findOneAndUpdate({}, { inactiveLicenseKeys: [] });

                await i.editReply('🗒️ All inactive license keys are now void.');
        }
    };
};

module.exports = LicenseKeysCommand;