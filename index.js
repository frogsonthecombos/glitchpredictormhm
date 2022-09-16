require('dotenv').config();

const { GatewayIntentBits } = require('discord.js');
const Bot = require('./classes/Bot');
const bot = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

bot.itemRegistry.loadEvents();
bot.login(process.env.token);