const glob = require('fast-glob');
const { resolve } = require('path');
const { Collection } = require('discord.js');

class ItemRegistry {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Collection();
        this.events = new Collection();
    }; // this is like the handler class
    // im gonna make a reload command but
    

    decache() {
        for (const key of Object.keys(require.cache)) {
            if (['events', 'commands'].some(k => key.includes(k))) delete require.cache[key];
        };
    };

    async loadEvents() {
        this.decache();
        this.events.clear();
        this.bot.removeAllListeners();

        const files = await glob('./events/**/*.js');

        for (const file of files) {
            const CustomEvent = require(resolve(file));
            const data = new CustomEvent(this);

            this.events.set(data.name, data);
            this.bot[data.occursOnce ? 'once' : 'on'](data.name, async (...args) => await data.exec(...args).catch(console.log));
        };
    };

    async loadCommands() {
        this.decache();
        this.commands.clear();

        const files = await glob('./commands/**/*.js');

        for (const file of files) {
            const CustomCommand = require(resolve(file));
            const data = new CustomCommand(this);

            this.commands.set(data.name, data);
        };

        await this.bot.application.commands.set(this.commands.map(c => c.payload));
    };
};

module.exports = ItemRegistry;