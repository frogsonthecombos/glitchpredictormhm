class CustomCommand {
    constructor(itemRegistry, data) {
        this.enabled = true;
        this.globalMongo = itemRegistry.bot.globalMongo;
        this.profileMongo = itemRegistry.bot.profileMongo;
        this.itemRegistry = itemRegistry;
        this.bot = itemRegistry.bot;
        this.utility = itemRegistry.bot.utility;

        Object.assign(this, data);
    };

    get payload() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            dmPermission: false
        };
    };
};

module.exports = CustomCommand;