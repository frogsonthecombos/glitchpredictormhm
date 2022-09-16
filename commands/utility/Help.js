const CustomCommand = require('../../classes/CustomCommand');
const EmbedSelector = require('../../classes/EmbedSelector');
const { stripIndents } = require('common-tags');

class HelpCommand extends CustomCommand {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'help',
            group: 'utility',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends my help menu.',
            licensedOnly: false,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const commands = this.itemRegistry.commands.map(c => c);
        const embeds = [{
            item: {
                label: 'Help',
                description: 'See the help menu...',
                value: 'help'
            },
            embed: {
                color: 0x5288fb,
                thumbnail: { url: this.bot.user.avatarURL() },
                title: '📁  Help Menu',
                description: stripIndents(`
                    Hey. Welcome to my help menu.
                    \`・\` You can look at over **${commands.length}** commands.
                    \`・\` There are around **${commands.filter(c => !c.ownerOnly).length}** public ones.
                `)
            }
        }];

        for (const group of this.utility.stripDupes(commands.map(c => c.group))) {
            const filtered = commands.filter(c => c.group === group);
            const title = this.utility.capitalize(group);

            embeds.push({
                item: {
                    label: `📂 ${title}`,
                    description: `See the ${group} commands?`,
                    value: group
                },
                embed: {
                    color: 0x5288fb,
                    title: `📂  ${title}`,
                    description: filtered
                        .map((c, i) => `\`${`${i + 1}`.padStart(filtered.length.toString().length, '0')}.\` /${c.name} **${c.description}**`)
                        .join('\n')
                }
            });
        };

        const selector = new EmbedSelector(i, {
            timeActive: 30_000,
            label: 'Pick a command group...',
            embeds: embeds
        });

        await selector.start();
    };
};

module.exports = HelpCommand;