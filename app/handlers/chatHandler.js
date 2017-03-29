import Botkit from 'botkit'
import * as messageFormatter from '../util/formatter'

if (!process.env.token) {
    console.log('Error: Specify token in environment')
    process.exit(1)
}
const listener = Botkit.slackbot({
    debug: false,
    stats_optout: false
});

const bot = listener.spawn({
    token: process.env.token
}).startRTM()

const user = {user:process.env.slack_user}

const startPrivateConversation = (id) => {
  return new Promise((resolve, reject) => {
    bot.startPrivateConversation(user, (err, convo) => {
      if (err) {
        reject(err)
      }
      convo.ask('Whats your plan for today? [' + id + ']', (message, convo) => {
        resolve(message)
        convo.next()
      })
    })
  })
}

const sendInteractiveMessageAsNewConversation = (list) => {
  bot.startPrivateConversation(user, (err, convo) => {
    askWithInteractiveMessage(list, convo);
  });
}

const askWithInteractiveMessage = (list, convo) => {
  const todoList = messageFormatter.generateList(list);
  convo.ask({
    attachments:[
      {
        title: 'Do you want to publish this list to your journal?',
        text: messageFormatter.formatListToSlackText(todoList),
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

const sendGeneratedListForApproval = (list, convo) => {
  if (convo) {
    askWithInteractiveMessage(list, convo);
  } else {
    sendInteractiveMessageAsNewConversation(list);
  }
}

export {
  listener,
  startPrivateConversation,
  sendInteractiveMessageAsNewConversation,
  sendGeneratedListForApproval
}
