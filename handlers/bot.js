import Botkit from 'botkit'
import * as formatter from '../util/formatter'
import * as storeHandler from '../handlers/store'
import {
  getListOfPrivateChannel,
  createPrivateChannel,
  inviteBotToPrivateChannel
} from '../handlers/api/slack'

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
  for (const key in tokens) {
    createNewDedicatedBotConnection(tokens[key])
  }
}

const greetingsAfterInstall = (bot, user) => {
  bot.startPrivateConversation({ user }, async(err, convo) => {
    const privateChannels = await getListOfPrivateChannel(user)
    const options = formatter.formatChannelsToOptions(privateChannels)

    convo.addMessage('Bye!','afterInstall_end')

    convo.addMessage({
      text: 'This is the list of private channels you own or you belong to.\n\nPlease select one in which Daily Planner should post your plans.',
      response_type: 'in_channel',
      attachments: [
        {
          fallback: 'Select channel of your team',
          color: '#3AA3E3',
          attachment_type: 'default',
          callback_id: 'journal_channel_join',
          actions: [
            {
              name: 'channels_list',
              text: 'Pick channel',
              type: 'select',
              options: options
            }
          ]
        }
      ]
    },'afterInstall_joinJournalChannel')

    convo.addQuestion('Ok! What name should we give it?',
      [
        {
          default: true,
          callback: async (message, response) => {
            const privateChannelResponse = await createPrivateChannel(message.user, message.text)
            const userId = message.user
            const channelId = privateChannelResponse.group.id
            await inviteBotToPrivateChannel(userId, channelId)
            storeHandler.storeJournalChannel(userId, channelId)
            convo.gotoThread('afterInstall_end')
          },
        }
      ], {},
      'afterInstall_createJournalChannel'
    )

    convo.addQuestion('Awesome! Should I create new channel or join already existing channel? `[ join / create ]`',
      [
        {
          pattern: 'join',
          callback: (message, response) => {
            convo.gotoThread('afterInstall_joinJournalChannel')
          },
        },
        {
          pattern: 'create',
          callback: (message, response) => {
            convo.gotoThread('afterInstall_createJournalChannel')
          },
        },
        {
          default: true,
          callback: (message, response) => { convo.repeat() },
        }
      ], {},
      'afterInstall_channelCreateOrJoin'
    )

    convo.addQuestion('Hi, thanks for installing me!\n\nI will help you manage your daily plans and keep you motivated and productive every day.\n\nVast majority of Daily App users like to share their daily lists in private channels called `journals` where only invited team members can see their daily progress.\n\nDo you want me to post your daily plan to slack channel? `[ yes / no ]`' ,
      [
        {
          pattern: bot.utterances.yes,
          callback: (message, response) => { convo.gotoThread('afterInstall_channelCreateOrJoin') },
        },
        {
          pattern: bot.utterances.no,
          callback: (message, response) => { convo.gotoThread('bye') },
        },
        {
          default: true,
          callback: (message, response) => { convo.repeat() },
        }
      ], {},
      'default'
    )
    convo.activate()
  })
}

const initDailySumUp = async (listId) => {
  for (const user in bots) {
    let unachievedTasks = await awaistoreHandler.fetchCurrentListUnachieved()
    if (unachievedTasks.length) {
      bots[user].startPrivateConversation({ user }, (err, convo) => {
        const slackFormattedList = formatter.formatListToSlackText(unachievedTasks)
        convo.setVar('slackFormattedList', slackFormattedList)
        convo.addMessage({
          attachments:[
            {
              title: 'You have some unachieved tasks from Today, would you like me to postpone them to tomorrow?',
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
        'ask_postpone_tasks')

        convo.activate()
      })
    }
  }
}

const initDailyPlan = async (listId) => {
  for (const user in bots) {
    if (await storeHandler.getUsersJournalChannelId(user)) {
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
}

const sendGeneratedListForApproval = (list, listId, user) => {
  bots[user].startPrivateConversation({ user }, (err, convo) => {
    const todoListOfTasks = formatter.generateList(list)
    const slackFormattedList = formatter.formatListToSlackText(todoListOfTasks)
    convo.setVar('slackFormattedList', slackFormattedList)
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
    'default')
    convo.activate()
  })
}



const sendMessageToJournal = async (callbackId, text, userId) => {
  const channel = await storeHandler.getUsersJournalChannelId(userId)
  bots[userId].api.chat.postMessage({
      channel,
      text: formatter.formatJournalListText(text),
      as_user: true
    }, (err, response) => {
      storeHandler.persistJournalMessageDetails(callbackId, response.ts, response.channel, userId)
    }
  )
}

const updateMessageInJournal = (ts, text, channel, userId) => {
  bots[userId].api.chat.update({
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
  sendGeneratedListForApproval,
}
