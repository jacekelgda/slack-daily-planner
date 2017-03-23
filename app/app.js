var request = require('request');
var Botkit = require('botkit');

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
    debug: true,
    stats_optout: true
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears('hello', 'direct_message', function(bot, message) {
    bot.reply(message, 'Hi!');
  }
);
