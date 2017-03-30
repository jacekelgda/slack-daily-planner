import Botkit from 'botkit'
import * as formatter from '../util/formatter'

if (!process.env.slack_bot_token) {
    console.log('Error: Specify token in environment')
    process.exit(1)
}
const listener = Botkit.slackbot({
    debug: false,
    stats_optout: false
});

const bot = listener.spawn({
    token: process.env.slack_bot_token
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
  })
}

const askWithInteractiveMessage = (list, convo) => {
  const todoList = formatter.generateList(list)
  convo.ask({
    attachments:[
      {
        title: 'Do you want to publish this list to your journal?',
        text: formatter.formatListToSlackText(todoList),
        callback_id: '123',
        attachment_type: 'default',
        actions: [
          {
            "name":"yes",
            "text": "Yes",
            "value": 1,
            "type": "button",
          },
          {
            "name":"no",
            "text": "No",
            "value": 0,
            "type": "button",
          }
        ]
      }
    ]
  })
}

const sendGeneratedListForApproval = (list, convo) => {
  if (convo) {
    askWithInteractiveMessage(list, convo);
  } else {
    sendInteractiveMessageAsNewConversation(list);
  }
}

const sendMessageToJournal = (text) => {
  bot.api.chat.postMessage({
    token: process.env.slack_api_token,
    channel: process.env.slack_test_channel,
    text: formatter.formatJournalListText(text),
    as_user: true
  }, (err,response) => {
    console.log('api response', response)
  })
}

export {
  listener,
  startPrivateConversation,
  sendInteractiveMessageAsNewConversation,
  sendGeneratedListForApproval,
  sendMessageToJournal
}
