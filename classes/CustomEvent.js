class CustomEvent {
    constructor(itemRegistry, data) {
        this.itemRegistry = itemRegistry;
        this.globalMongo = itemRegistry.bot.globalMongo;
        this.profileMongo = itemRegistry.bot.profileMongo;
        this.bot = itemRegistry.bot;
        this.utility = itemRegistry.bot.utility;
        
        Object.assign(this, data);
    };
};

module.exports = CustomEvent;