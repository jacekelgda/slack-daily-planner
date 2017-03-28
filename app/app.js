const Botkit = require('botkit');
const cron = require('node-cron');
const firebase = require('firebase');

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var listener = Botkit.slackbot({
    debug: false,
    stats_optout: false
});

var bot = listener.spawn({
    token: process.env.token
}).startRTM();

const config = {
  apiKey: process.env.firebase_config_apiKey,
  authDomain: process.env.firebase_config_authDomain,
  databaseURL: process.env.firebase_config_databaseURL,
  storageBucket: process.env.firebase_config_storageBucket,
  messagingSenderId: process.env.firebase_config_messagingSenderId
};

const app = firebase.initializeApp(config);

// init
setupCron();
// init <end>

// responding to direct messages
listener.on('direct_message', (bot, message) => {
  handleDirectMessage(message);
})

handleDirectMessage = (message) => {
  getCurrentListId()
    .then((id) => persistTasksFromMessageToList(id, message))
    .then(fetchCurrentList)
    .then((tasks) => sendGeneratedListForApproval(tasks));
}

processMessage = (message) => {
  const itemsString = message.text;
  const items = itemsString.split(";").map((item) => {
    return item.trim();
  });

  return items;
}
// responding to direct messages <end>

// generate list
generateList = (taskList) => {
  let list = [];
  taskList.forEach((item, index) => {
    list[index] = '[' + (item.achieved ? 'x' : ' ') +'] ' + item.name + '\n';
  })
  return list;
}

formatListToSlackText = (list) => {
  let listAsText = '';
  list.forEach((item, index) => {
    listAsText += item;
  });

  return listAsText;
}
// generate list <end>

sendGeneratedListForApproval = (list, convo) => {
  if (convo) {
    askWithInteractiveMessage(list, convo);
  } else {
    sendInteractiveMessageAsNewConversation(list);
  }
}

askWithInteractiveMessage = (list, convo) => {
  const todoList = generateList(list);
  convo.ask({
      attachments:[
          {
              title: 'Do you want to publish this list to your journal?',
              text: formatListToSlackText(todoList),
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

sendInteractiveMessageAsNewConversation = (list) => {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    askWithInteractiveMessage(list, convo);
  });
}

createNewTasksList = (id, message) => {
  return new Promise((resolve, reject) => {
    const items = processMessage(message);
    items.forEach((item, index) => {
      firebase.database().ref('lists/' + id + '/tasks/' + index).set({
        name: item,
        achieved: false
      });
    });

    resolve(true);
  });
}

// firebase
persistTasksFromMessageToList = (id, message) => {
  const items = processMessage(message);
  fetchCurrentList().then((tasks) => {
    items.forEach((item, index) => {
      firebase.database().ref('lists/' + id + '/tasks/' + (index + tasks.length)).set({
        name: item,
        achieved: false
      });
    });
  });
}

getCurrentListId = () => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists').limitToLast(1);
    lastEntry.on('value', (snapshot) => {
      let listId;
      snapshot.forEach(function(data) {
        listId = data.key
      });
      resolve(listId)
    });
  })
}

fetchCurrentList = () => {
  return new Promise((resolve, reject) => {
    const lastEntry = firebase.database().ref('lists').limitToLast(1);
    lastEntry.on('value', (snapshot) => {
      let tasks;
      snapshot.forEach(function(data) {
        tasks = data.val().tasks;
      });
      resolve(tasks);
    });
  })
}
// firebase <end>
// starting conversation
function setupCron() {
  cron.schedule('* * * * *', () => {
    privateConversation(Date.now());
  });
}

function privateConversation(id) {
  bot.startPrivateConversation({user:process.env.slack_user}, (err, convo) => {
    convo.ask('Whats your plan for today?', (message, convo) => {
      createNewTasksList(id, message)
        .then(fetchCurrentList)
        .then((tasks) => sendGeneratedListForApproval(tasks));;
      convo.next();
    });
  });
}
// starting conversation <end>
