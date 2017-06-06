import Botkit from 'botkit'
import * as formatter from '../util/formatter'
import * as storeHandler from '../handlers/store'

let bots = []

const listener = Botkit.slackbot({
  debug: false,
  stats_optout: false
})

const createNewBotConnection = (token) => {
  const bot = listener.spawn({ token: token.token }).startRTM()
  bots[token.team] = bot
}

const createNewDedicatedBotConnection = (token) => {
  const bot = listener.spawn({ token: token.token }).startRTM()
  bots[token.user] = bot

  return bots[token.user]
}

const resumeAllConnections = (tokens) => {
  for ( const key in tokens ) {
    createNewDedicatedBotConnection(tokens[key])
  }
}

const greetingsAfterInstall = (bot, userId) => {
  bot.say({
    text: 'Hello',
    channel: userId
  })
}

const initDailyPlan = (listId) => {
  for (const user in bots) {
    bots[user].startPrivateConversation({ user }, (err, convo) => {

      convo.addMessage({
        attachments:[
          {
            title: 'Do you want to publish this list to your journal?',
            text: `{{vars.slackFormattedList}}`,
            callback_id: listId,
            attachment_type: 'default',
            actions: [
              {
                name: "yes",
                text: "Yes",
                value: 1,
                type: "button",
              },
              {
                name: "no",
                text: "No",
                value: 0,
                type: "button",
              }
            ]
          }
        ]
      },
      'present_daily_plan'
    )

      convo.addQuestion('Whats your plan for today?',
        [
          {
            default: true,
            callback: async function(message, response) {
              const tasks = formatter.processMessage(message)
              const tasksData = await storeHandler.createNewTasksList(listId, tasks, user)
              const todoListOfTasks = formatter.generateList(tasksData)
              const slackFormattedList = formatter.formatListToSlackText(todoListOfTasks)
              convo.setVar('slackFormattedList', slackFormattedList)
              convo.gotoThread('present_daily_plan')
            }
          },
        ],
        {},
        'default'
      )

      convo.activate()
    })
  }
}

// const sendGeneratedListForApproval = (list, listId, convo) => {
//   if (convo) {
//     askWithInteractiveMessage(list, listId, convo)
//   } else {
//     sendInteractiveMessageAsNewConversation(list, listId)
//   }
// }


// for now channel is set for testing. this should be changed
// for some automated flow where user picks the channel bot posts to
const sendMessageToJournal = (callbackId, text, userId) => {
  bots[userId].api.chat.postMessage({
      channel: process.env.slack_dev_test_channel,
      text: formatter.formatJournalListText(text),
      as_user: true
    }, (err, response) => {
      storeHandler.persistJournalMessageDetails(callbackId, response.ts, response.channel, userId)
    }
  )
}

const updateMessageInJournal = (ts, text, channel) => {
  bot.api.chat.update({
    token: process.env.slack_api_token,
    ts: ts,
    channel: channel,
    text: formatter.formatJournalListText(text),
    as_user: true
  }, (err,response) => {
    console.log('update message response', response)
  })
}

export {
  listener,
  initDailyPlan,
  sendMessageToJournal,
  updateMessageInJournal,
  resumeAllConnections,
  createNewDedicatedBotConnection,
  bots,
  greetingsAfterInstall,
}
