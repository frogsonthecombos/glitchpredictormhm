class Utility {
    constructor(bot) {
        this.bot = bot;
    };

    async getMongoData() {
        return await this.bot.globalMongo.findOne();
    };

    async makeCustomProfile(userId) {
        if (!await this.getCustomProfile(userId)) {
            const doc = new this.bot.profileMongo({
                userId: userId,
                licenseDuration: 0,
                licensedSince: 0,
                bloxFlipToken: null,
                robloxUserId: null,
                profileColor: null,
                commandsExecuted: 0,
                minesGenerated: 0,
                casesSearched: 0,
                crashPointsPredicted: 0,
                rouletteColorsPredicted: 0,
                jackpotsCalculated: 0,
                bloxFlipProfilesSearched: 0,
                robuxTokensPredicted: 0,
                towersGenerated: 0,
                towerLaddersPredicted: 0,
                achievementsEarned: []
            });

            await doc.save();
        };
    };

    async getCustomProfile(userId) {
        return await this.bot.profileMongo.findOne({ userId: userId });
    };

    async updateCustomProfile(userId, prop, val) {
        const doc = await this.bot.profileMongo.findOne({ userId: userId });

        doc[prop] = val;

        await doc.save();
    };

    makeMoreArrays(arr, limitPerArray = 1) {
        let storage = [[]];
        const copy = arr;

        for (const c of copy) {
            storage[storage.length - 1].push(c);

            const length = storage.length - 1;

            if (storage[length].length === limitPerArray) {
                storage[length + 1] = [];
            };
        };

        return storage.filter(s => s.length > 0);
    };

    buildProgressReport(min, max, size) {
        const percent = min / max;
        const progress = Math.round(size * percent);

        return {
            container: `[${"#".repeat(progress)}${" ឵឵".repeat(size - progress)}]`,
            completed: Math.round(percent * 100)
        };
    };

    capitalize(str) {
        return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
    };

    genRobloxString() {
        const words = [
            'lua', 'roblox', 'builder',
            'part', 'brick', 'color',
            'dog', 'cat', 'hamster',
            'alien', 'player', 'bone',
            'frog', 'hax', 'fire',
            'ice', 'water', 'air'
        ];

        let chosen = [];

        for (let i = 0; i < 5; i++) {
            chosen.push(words[Math.floor(Math.random() * words.length)]);
        };

        return chosen.join(' ');
    };

    genRandomString(length = 2) {
        const types = [
            Array.from(Array(26)).map((n, i) => i + 65).map(i => String.fromCharCode(i)),
            Array.from(Array(10)).map((n, i) => i)
        ];

        let str = '';

        for (let i = 0; i < length; i++) {
            const choice = types[Math.floor(Math.random())];

            str += this.random(choice);
        };

        return str;
    };

    round(number) {
        if (number < 10) return Math.round(number / 5) * 5;

        return Math.round(number / 10) * 10;
    };

    stripDupes(arr) {
        const arrTwo = [];

        for (const item of arr) {
            if (!arrTwo.includes(item)) arrTwo.push(item);
        };

        return arrTwo;
    };

    random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };
};


module.exports = Utility;