const CustomCommand = require('../../classes/CustomCommand');

class ActivateLicenseKeyCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'activatelicensekey',
            group: 'utility',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Activates an inactive license key.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 3,
                name: 'licensekey',
                description: 'What license key would you like to activate?',
                required: true
            }]
        });
    };

    async exec(i) {
        const key = i.options.getString('licensekey');
        const mongo = await this.utility.getMongoData();
        const regKey = mongo.inactiveLicenseKeys.filter(k => k.key === key)[0];
        const profile = await this.utility.getCustomProfile(i.user.id);
        
        if (!regKey || regKey.owner !== i.user.id) return i.editReply('⚠️ No verified license key found.');

        await this.utility.updateCustomProfile(i.user.id, 'licenseDuration', regKey.duration);
        await this.utility.updateCustomProfile(i.user.id, 'licensedSince', Date.now());
        await i.guild.members.addRole(i.user.id, mongo.customerRole).catch(() => {});

        await i.editReply('🗒️ Activated license key successfully.');
    };
};

module.exports = ActivateLicenseKeyCommand;