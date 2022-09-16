const CustomEvent = require('../../classes/CustomEvent');
const petitio = require('petitio');
const { stripIndents } = require('common-tags');

class ReadyEvent extends CustomEvent {
    constructor(itemRegistry) {
        super(itemRegistry, {
            name: 'ready',
            occursOnce: true
        });

        this.lastCrashPoint = 0;
    };

    async exec() {
        await this.bot.readyUp();

        setInterval(async () => {
            const mongo = await this.utility.getMongoData();
            const plutonRes = await petitio(`https://pluton-app.herokuapp.com/v4/crash`).send();
            const data = plutonRes.json();

            try {
                if (data.crashEstimation === this.lastCrashPoint) return;

                this.lastCrashPoint = data.crashEstimation;

                const channel = this.bot.channels.cache.get(mongo.crashPointChannel);

                if (channel) {
                    await channel.send({
                        embeds: [{
                            color: 0x5288fb,
                            title: '📈 Crash (Automatic)',
                            description: stripIndents(`
                                \`・\` Estimation: **${data.averageCrashpoint + (data.averageCrashpoint < 1 ? 1 : 0)}x**
                                \`・\` Potential: **${data.potentialCrashpoint + (data.potentialCrashpoint < 1 ? 1 : 0)}x**
                                \`・\` Last Crashpoint: **${data.lastCrashpoint + (data.lastCrashpoint < 1 ? 1 : 0)}x** 
                            `)
                        }]
                    })
                };
            } catch { };
        }, 5000);

        setInterval(async () => {
            for (const user of this.bot.users.cache.map(u => u)) {
                const profile = await this.utility.getCustomProfile(user.id);

                if (profile && (Date.now() - profile.licensedSince) > profile.licenseDuration) {
                    await this.utility.updateCustomProfile(user.id, 'licensedSince', 0);
                    await this.utility.updateCustomProfile(user.id, 'licenseDuration', 0);
                };
            };
        }, 60_000);

        console.log('good2go');

        await this.bot.user.setPresence({
            status: 'online',
            activities: [{
                type: 1,
                name: '.gg/profitable',
                url: 'https://twitch.tv/gg_profitable'
            }]
        });
    };
};

module.exports = ReadyEvent;