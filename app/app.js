var Botkit = require('botkit');
var cron = require('node-cron');

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var listener = Botkit.slackbot({
    debug: true,
    stats_optout: true
});

var bot = listener.spawn({
    token: process.env.token
}).startRTM();

// responding to direct messages
listener.on('direct_message', (bot, message) => {
  const itemsString = message.text;
  const items = itemsString.split(";").map((item) => {
    return item.trim();
  })
  const list = generateList(items);
  sendGeneratedListForApproval(list);
})
// responding to direct messages <end>

// generate list
function generateList(items) {
  const list = items.map((item) => {
    return '[ ] ' + item + '\n';
  })

  return list;
}

function formatListToSlackText(list) {
  let listAsText = '';
  list.forEach((item, index) => {
    listAsText += item;
  });

  return listAsText;
}
// generate list <end>

function sendGeneratedListForApproval(list) {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    console.log(process.env.slack_user);
    convo.say({
        attachments:[
            {
                title: 'Do you want to publish this list to your journal?',
                text: formatListToSlackText(list),
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
            }
        ]
    });
  });
}

// starting conversation
function setupCron() {
  cron.schedule('* * * * *', function(){
    privateConversation();
  });
};

function privateConversation() {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    convo.ask('Whats your plan for today?', (response, convo) => {
      convo.say('Cool, you said: ' + response.text);
      convo.next();
    });
  });
};
// starting conversation <end>
