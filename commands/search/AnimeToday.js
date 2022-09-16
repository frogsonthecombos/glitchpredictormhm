const CustomCommand = require('../../classes/CustomCommand');
const agent = require('node-superfetch');
const { stripIndents } = require('common-tags');
const moment = require('moment-timezone');
const EmbedSelector = require('../../classes/EmbedSelector');
const HttpsProxyAgent = require('https-proxy-agent');
const { generateProxy } = require('@wonoly/proxy-generator');

class AnimeTodayCommand extends CustomCommand {
    constructor(client) {
        super(client, {
            name: 'animetoday',
            group: 'search',
            ownerOnly: false,
            coreOwnerOnly: false,
            useEphemeral: false,
            description: 'Sends the top 20 anime airing today in Tokyo.',
            licensedOnly: true,
            managerOnly: false,
            options: []
        });
    };

    async exec(i) {
        const today = new Date();
        const tomorrow = new Date(today);
        const embeds = [];

        tomorrow.setDate(tomorrow.getDate() + 1);

        const animes = await agent
            .post('https://graphql.anilist.co')
            .send({
                agent: new HttpsProxyAgent(await generateProxy().then(p => p.url)),
                variables: {
                    greater: parseInt(today.getTime() / 1000, 10),
                    lower: parseInt(tomorrow.getTime() / 1000, 10)
                },
                query: stripIndents(`
                    query AiringSchedule($greater: Int, $lower: Int) {
                        anime: Page {
                            results: airingSchedules(airingAt_greater: $greater, airingAt_lesser: $lower) {
                                airingAt
                                media {
                                    id
                                    countryOfOrigin
                                    bannerImage
                                    coverImage {
                                        large
                                    }
                                    status
                                    hashtag
                                    genres
                                    siteUrl
                                    isAdult
                                    favourites
                                    episodes
                                    startDate {
                                        year
                                        month
                                        day
                                    }
                                    title {
                                        english
                                        romaji
                                        native
                                    }
                                }
                            }
                        }
                    }
                `)
            })
            .then(r => r.body.data.anime.results);

        if (!animes.length) return i.editReply('💔 No anime air today!');

        embeds.push({
            item: {
                label: '📺 Anime Airing Today',
                description: 'See the anime airing today...',
                value: 'anime_airing_today'
            },
            embed: {
                color: 0x5288fb,
                title: '📺 Anime Airing Today',
                description: stripIndents(`
                    \`・\` Check out these animes airing today in Tokyo.
                    \`・\` Use the dropdown below to see one of these animes.
                    \`・\` Note that all of these timestamps are Japanese.
                    \`・\` Credits to ** https://anilist.co **

                    ${animes
                        .map(({ airingAt, media }, i) => `\`${`${i + 1}`.padStart(animes.length.toString().length, '0')}.\` [${media.title.english || media.title.romaji || media.title.native}](https://anilist.co/anime/${media.id}) **${moment(airingAt).tz('Asia/Tokyo').format('hh:mm A')}**`)
                        .join('\n')
                    }
                `)
            }
        });

        animes.splice(20);
        animes.sort((a, b) => b.airingAt - a.airingAt);

        for (const { media } of animes) {
            const title = media.title.english || media.title.romaji || media.title.native;

            embeds.push({
                item: {
                    label: title,
                    description: `📺 See the anime "${title}"...`,
                    value: media.id.toString()
                },
                embed: {
                    color: 0x5288fb,
                    url: media.siteUrl,
                    thumbnail: { url: media.coverImage.large },
                    title,
                    fields: [{
                        name: 'Social',
                        value: stripIndents(`
                            Hashtag: \`${media.hashtag || 'N/A'}\`
                            Favorites: \`${media.favourites}\`
                        `),
                        inline: true
                    }, {
                        name: 'Details',
                        value: stripIndents(`
                            Origin country: \`${media.countryOfOrigin}\`
                            Adult rated: \`${media.isAdult ? 'Yes' : 'No'}\`
                            Episodes: \`${media.episodes || 'N/A'}\`
                        `),
                        inline: true
                    }, {
                        name: 'Dates',
                        value: stripIndents(`
                            Updated last: \`${moment(media.updatedAt).format('L')}\`
                            Started: \`${media.startDate.month}/${media.startDate.day}/${media.startDate.year}\`
                        `),
                        inline: true
                    }, {
                        name: 'Titles',
                        value: stripIndents(`
                            English: \`${media.title.english ? media.title.english : '???'}\`
                            Romaji: \`${media.title.romaji ? media.title.romaji : '???'}\`
                            Native: \`${media.title.native ? media.title.native : '???'}\`
                        `),
                        inline: true
                    }, {
                        name: 'Genres',
                        value: media.genres.map(g => `\`${g}\``).join(', '),
                        inline: true
                    }],
                    image: { url: media.bannerImage }
                }
            });
        };

        const selector = new EmbedSelector(i, {
            timeActive: 60_000,
            label: 'Pick an anime...',
            embeds: embeds
        });

        await selector.start();
    };
};

module.exports = AnimeTodayCommand;