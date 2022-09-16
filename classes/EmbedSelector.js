const ComponentCollector = require('./ComponentCollector');

class EmbedSelector {
    constructor(i, values) {
        this.i = i;
        this.embeds = values.embeds;
        this.timeActive = values.timeActive;
        this.index = 0;
        this.components = [{
            type: 3,
            customId: 'select',
            minValues: 1,
            maxValues: 1,
            placeholder: values.label,
            options: this.embeds.map(e => e.item)
        }];
    };

    async start() {
        await this.i.editReply(this.payload);

        const collector = new ComponentCollector(this.i, {
            timeActive: this.timeActive,
            exec: async (collector, item) => {
                this.index = this.embeds.findIndex(e => e.item.value === item.values[0]);

                await item.deferUpdate();
                await item.editReply(this.payload);

                collector.resetTimer();
            },
            destroy: async (collector, elements, reason) => {
                if (!reason.includes('delete')) {
                    this.components = [];
    
                    await this.i.editReply({ ...this.payload, components: [] });
                };
            }
        });

        await collector.collect();
    };

    get payload() {
        return {
            embeds: [this.embeds[this.index].embed],
            components: [{
                type: 1,
                components: this.components
            }]
        };
    };
};

module.exports = EmbedSelector;