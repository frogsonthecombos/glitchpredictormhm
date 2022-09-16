const CustomCommand = require('../../classes/CustomCommand');
const cloudscraper = require('cloudscraper');
const petitio = require('petitio');
const { stripIndents } = require('common-tags');

class BloxflipProfileCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'bloxflipprofile',
            group: 'info',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Gets the Bloxflip profile using a Bloxflip/Roblox ID.',
            licensedOnly: false,
            managerOnly: false,
            options: [{
                type: 3,
                name: 'id',
                description: 'What is the Bloxflip/Roblox ID of the user?',
                required: true
            }]
        });
    };

    async exec(i) {
        const id = i.options.getString('id');
        const res = await cloudscraper.get(`https://api.bloxflip.com/user/lookup/${id}`);
        const data = JSON.parse(res);

        if (!data.success) return i.editReply('⚠ No user found.');

        const body = await petitio(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&format=Png&size=720x720`).send();
        const thumbnail = body.json().data[0].imageUrl;

        await i.editReply({
            embeds: [{
                color: 0x5288fb,
                thumbnail: { url: thumbnail },
                title: `🔎 @${data.username}`,
                description: stripIndents(`
                    \`・\` Rank: **${data.rank}**
                    \`・\` Games played: **${data.gamesPlayed}**
                    \`・\` Rain winnings: **${Math.round(data.rainWinnings)}**
                    \`・\` Wagered: **$${Math.round(10 * data.wager) / 10}**
                    \`・\` Trivia winnings: **$${Math.round(data.triviaWinnings)}**
                `)
            }]
        });
    };
};

module.exports = BloxflipProfileCommand;