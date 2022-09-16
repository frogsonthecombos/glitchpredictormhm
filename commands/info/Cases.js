const CustomCommand = require('../../classes/CustomCommand');
const EmbedPager = require('../../classes/EmbedPager');
const { stripIndents } = require('common-tags');
const cloudscraper = require('cloudscraper');
const shuffle = require('shuffle-array');

class CasesCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'cases',
            group: 'info',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Displays the current case market and allows case searching.',
            licensedOnly: true,
            managerOnly: false,
            options: [{
                type: 1,
                name: 'market',
                description: 'Displays the current case market.'
            }, {
                type: 1,
                name: 'search',
                description: 'Displays a specific case\'s info.',
                options: [{
                    type: 3,
                    name: 'name',
                    description: 'What\'s the name of the case?',
                    required: true
                }]
            }]
        });
    };

    async exec(i) {
        const res = await cloudscraper.get('https://api.bloxflip.com/games/cases');
        const comRes = await cloudscraper.get('https://api.bloxflip.com/games/community-cases');
        const data = JSON.parse(res);
        const comData = JSON.parse(comRes);
        const allCases = shuffle([...data.cases, ...comData.cases]);
        let inx = 0;
        let pager = null;

        switch (i.options.getSubcommand()) {
            case 'market':
                const embeds = [{
                    color: 0x5288fb,
                    title: '📦 Case Market',
                    description: stripIndents(`
                        Welcome to the case market, where you can visit the info pages of over **${allCases.length}** cases. You also have the ability to search through the market, viewing specific cases and their more in-depth details such as the items included.

                        Use the buttons below to navigate the market. Most of it is self-explanatory.
                    `)
                }];

                for (const cases of this.utility.makeMoreArrays(allCases, 10)) {
                    inx++;

                    embeds.push({
                        color: 0x5288fb,
                        title: `📦 Case Market (pg. ${inx})`,
                        description: cases.map(c => `\`・\` **${c.displayName}** ($${c.price})`).join('\n')
                    });
                };

                pager = new EmbedPager(i, {
                    timeActive: 120_000,
                    allowOthers: false,
                    embeds: embeds,
                    customButtons: []
                });

                await pager.start();

                break;
            case 'search':
                const name = i.options.getString('name');
                const info = allCases.filter(c => c.displayName.toLowerCase().includes(name.toLowerCase()))[0];

                if (!info) return i.editReply('⚠️ No case found.');

                const url = `https://bloxflip.com/${info.creator ? 'community-cases' : 'cases'}/${info.slug === '' ? info.uuid : info.slug}`

                pager = new EmbedPager(i, {
                    timeActive: 60_000,
                    allowOthers: false,
                    embeds: [{
                        color: 0x5288fb,
                        thumbnail: { url: info.image },
                        url: url,
                        title: `📦 Case Market: ${info.displayName}`,
                        description: stripIndents(`
                            The title **__URL__** leads to the case.
    
                            \`・\` Community case: **${info.communityCase ? 'Yes' : 'No'}**
                            \`・\` Minimum LVL required: **${info.minimumLevel}**
                            \`・\` Price: **${info.price}**
                            \`・\` Minimum wager: **$${info.minimumWager}**
                        `)
                    }, {
                        color: 0x5288fb,
                        thumbnail: { url: info.image },
                        url: url,
                        title: `📦 Case Market: ${info.displayName} (Items)`,
                        description: stripIndents(`
                            Here are all of the case's items...

                            ${info.items.map(i => `\`・\` **${i.assetName}** ($${i.value})`).join('\n')}
                        `)
                    }],
                    customButtons: []
                });
                
                await pager.start();
        };
    };
};

module.exports = CasesCommand;