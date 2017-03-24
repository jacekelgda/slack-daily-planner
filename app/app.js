const Botkit = require('botkit');
const cron = require('node-cron');
const firebase = require('firebase');

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

const config = {
  apiKey: "AIzaSyD0BSlwscNQdUlkKkDN96nk8NUt7jIHd_M",
  authDomain: "todos-16130.firebaseapp.com",
  databaseURL: "https://todos-16130.firebaseio.com",
  storageBucket: "todos-16130.appspot.com",
  messagingSenderId: "1033025372827"
};
const app = firebase.initializeApp(config);

// start
setupCron();
// start <end>

// responding to direct messages
listener.on('direct_message', (bot, message) => {
  handleMessage(message);
})

function handleMessage(message) {
  const items = processMessage(message);
  const list = generateList(items);
  sendGeneratedListForApproval(list);
}

function processMessage(message) {
  const itemsString = message.text;
  const items = itemsString.split(";").map((item) => {
    return item.trim();
  });

  return items;
}
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

function sendGeneratedListForApproval(list, convo) {
  if (convo) {
    askWithInteractiveMessage(list, convo);
  } else {
    sendInteractiveMessageAsNewConversation(list);
  }
}

function askWithInteractiveMessage(list, convo) {
  convo.ask({
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
}

function sendInteractiveMessageAsNewConversation(list) {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    askWithInteractiveMessage(list, convo);
  });
}


function persistInitialListTasks(id, message) {
  const items = processMessage(message);
  items.forEach((item, index) => {
    firebase.database().ref('lists/' + id + '/tasks/' + index).set({
      name: item,
      achieved: false
    });
  })
}

// starting conversation
function setupCron() {
  privateConversation(Date.now());
  cron.schedule('* * * * *', () => {
    privateConversation(Date.now());
  });
};

function privateConversation(id) {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    convo.ask('Whats your plan for today?', (message, convo) => {
      console.log('updating list/' + id);
      persistInitialListTasks(id, message);
      convo.say('Cool, you said: ' + message.text);
      convo.next();
    });
  });
};
// starting conversation <end>
