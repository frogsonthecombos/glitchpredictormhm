class ComponentCollector {
    constructor(i, data) {
        this.i = i;

        Object.assign(this, data);
    };

    async collect() {
        const reply = await this.i.fetchReply();

        this.collector = await reply.createMessageComponentCollector({
            filter: !this.allowOthers ? i => i.user.id === this.i.user.id : null,
            time: this.timeActive, dipose: true
        });

        this.collector.on('collect', async (...args) => await this.exec(this.collector, ...args).catch(() => {}));
        this.collector.on('end', async (...args) => await this.destroy(this.collector, ...args).catch(() => {}));
        this.collector.on('ignore', async component => await component.followUp('You can\'t use this component!', { ephemeral: true }).catch(() => {}));
    };
};

module.exports = ComponentCollector;