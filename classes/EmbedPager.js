const ComponentCollector = require('./ComponentCollector');

class EmbedPager {
    constructor(i, data) {
        this.i = i;
        this.embeds = data.embeds;
        this.timeActive = data.timeActive;
        this.index = 0;
        this.customButtons = data.customButtons;
        this.allowOthers = data.allowOthers;
        this.components = [{
            type: 2,
            customId: 'timeout',
            label: '⏰',
            style: 2
        }, {
            type: 2,
            customId: 'left',
            label: '⬅️',
            style: 2
        }, {
            type: 2,
            customId: 'right',
            label: '➡️',
            style: 2
        }];
    };

    addTo(itemName, data) { this[itemName] = [...this[itemName], ...data]; };
    left() { this.index === 0 ? this.index = this.embeds.length - 1 : this.index-- };
    right() { this.index === this.embeds.length - 1 ? this.index = 0 : this.index++ };

    async start() {
        await this.i.editReply(this.payload);

        const collector = new ComponentCollector(this.i, {
            timeActive: this.timeActive,
            allowOthers: this.allowOthers,
            exec: async (collector, button) => {
                await button.deferUpdate();

                const custom = this.customButtons.filter(b => b.customId === button.customId)[0];

                switch (button.customId) {
                    case 'timeout': collector.stop(); break;
                    case 'left': this.left(); break;
                    case 'right': this.right(); break;
                    default: await custom.exec().catch(() => { });
                };

                await this.i.editReply(this.payload).catch(() => { });

                collector.resetTimer();
            },
            destroy: async (collector, elements, reason) => {
                if (!reason.includes('delete')) {
                    this.components = this.components.map(c => c.disabled = true);

                    await this.i.editReply(this.payload).catch(() => { });
                };
            }
        });

        await collector.collect();
    };

    get payload() {
        return {
            embeds: [this.embeds[this.index]],
            components: [{
                type: 1,
                components: this.components
            }]
        };
    };
};

module.exports = EmbedPager;