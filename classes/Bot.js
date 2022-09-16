const { Client } = require('discord.js');
const { model, Schema, connect } = require('mongoose');
const ItemRegistry = require('./ItemRegistry');
const Utility = require('./Utility');

class Bot extends Client {
    constructor(data) {
        super(data);

        this.token = process.env.token;
        this.itemRegistry = new ItemRegistry(this);
        this.utility = new Utility(this);
        this.owners = process.env.owners.split(', ');
        this.globalMongo = model('data', new Schema({
            assetNum: Number,
            serverHashCombo: String,
            crashPointChannel: String,
            ownerRegistry: Array,
            managerRegistry: Array,
            blacklistRegistry: Array,
            chatMacros: Array,
            customerRole: String,
            permittedPredictionChannels: Array,
            inactiveLicenseKeys: Array,
            commandsExecuted: Number,
            minesGenerated: Number,
            casesSearched: Number,
            crashPointsPredicted: Number,
            rouletteColorsPredicted: Number,
            jackpotsCalculated: Number,
            bloxFlipProfilesSearched: Number,
            robuxTokensPredicted: Number,
            towersGenerated: Number,
            towerLaddersPredicted: Number,
            achievementsEarned: Number,
            contentCreatorRegistry: Array
        }));

        this.profileMongo = model('profile', {
            userId: String,
            licenseDuration: Number,
            licensedSince: Number,
            bloxFlipToken: String,
            robloxUserId: Number,
            profileColor: Number,
            commandsExecuted: Number,
            minesGenerated: Number,
            casesSearched: Number,
            crashPointsPredicted: Number,
            rouletteColorsPredicted: Number,
            jackpotsCalculated: Number,
            bloxFlipProfilesSearched: Number,
            robuxTokensPredicted: Number,
            towersGenerated: Number,
            towerLaddersPredicted: Number,
            achievementsEarned: Array
        });
    };

    async readyUp() {
        connect(process.env.mongo);

        await this.itemRegistry.loadCommands();

        const data = await this.utility.getMongoData();

        if (!data) {
            const doc = new this.globalMongo({
                assetNum: 0,
                ownerRegistry: [],
                customerRole: null,
                crashPointChannel: null,
                serverHashCombo: '',
                managerRegistry: [],
                blacklistRegistry: [],
                chatMacros: [],
                permittedPredictionChannels: [],
                inactiveLicenseKeys: [],
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
                achievementsEarned: 0,
                contentCreatorRegistry: []
            });

            await doc.save();
        };
    };
};

module.exports = Bot;