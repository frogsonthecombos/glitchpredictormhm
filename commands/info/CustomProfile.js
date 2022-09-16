const { stripIndents } = require('common-tags');
const CustomCommand = require('../../classes/CustomCommand');
const EmbedPager = require('../../classes/EmbedPager');
const petitio = require('petitio');
const ms = require('ms');
const moment = require('moment');

class CustomProfileCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'customprofile',
            group: 'info',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends a user\'s custom profile.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 6,
                name: 'user',
                description: 'Who would you like to get the profile of?',
                required: false
            }]
        });
    };

    async exec(i) {
        const user = i.options.getUser('user', false);
        const target = user || i.user;
        const profile = await this.utility.getCustomProfile(target.id);
        const req = await petitio(`https://users.roblox.com/v1/users/${profile.robloxUserId || 0}`).send();
        const res = req.json();
        const body = await petitio(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${profile.robloxUserId || 0}&format=Png&size=720x720`).send();
        const thumbnail = body.json().data[0]?.imageUrl;
        const pager = new EmbedPager(i, {
            timeActive: 120_000,
            allowOthers: false,
            embeds: [{
                color: 0x5288fb,
                title: `🔎 Statistics`,
                description: stripIndents(`
                    Showing the profile of \`${target.tag}\`
                    
                    \`・\` Achievements earned: **${profile.achievementsEarned.length}**
                    \`・\` Commands executed: **${profile.commandsExecuted}**
                    \`・\` Cases searched: **${profile.casesSearched}**
                    \`・\` Mines generated: **${profile.minesGenerated}**
                    \`・\` Crash points predicted **${profile.crashPointsPredicted}**
                    \`・\` Roulette colors predicted: **${profile.rouletteColorsPredicted}**
                    \`・\` Robux spots predicted: **${profile.robuxTokensPredicted}**
                    \`・\` Towers generated: **${profile.towersGenerated}**
                    \`・\` Tower ladders predicted: **${profile.towerLaddersPredicted}**
                    \`・\` Bloxflip profiles searched: **${profile.bloxFlipProfilesSearched}**
                `)
            }, {
                color: 0x5288fb,
                title: '🔎 License Info',
                description: profile.licensedSince === 0
                    ? 'No license acquired yet.'
                    : stripIndents(`
                        \`・\` Licensed since: **${moment(profile.licensedSince).format('LL')}**
                        \`・\` License time left: **${ms(profile.licenseDuration - (Date.now() - profile.licensedSince))}**
                    `)
            }, {
                color: 0x5288fb,
                thumbnail: { url: thumbnail },
                title: '🔎 Roblox Details',
                description: profile.robloxUserId
                    ? stripIndents(`
                        Registered under the ID **${profile.robloxUserId}**.

                        \`・\` Username: **@${res.name}**
                        \`・\` Display name: **${res.displayName}**
                        \`・\` Verified: **${res.hasVerifiedBadge}**
                    `)
                    : 'No registered ID so far.'
            }, {
                color: 0x5288fb,
                title: '🔎 Achievements Earned',
                description: profile.achievementsEarned.length
                    ? profile.achievementsEarned.map(a => `\`・\` ${a}`).join('\n')
                    : 'No registered achievements so far.'
            }],
            customButtons: []
        });

        await pager.start();
    };
};

module.exports = CustomProfileCommand;