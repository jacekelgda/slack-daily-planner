import bodyParser from 'body-parser'
import express from 'express'

import router from './controllers'
import routerViews from './views'

import { lookForCompletedTask } from './util/textInterpreter'

import * as botHandler from './handlers/bot'
import * as storeHandler from './handlers/store'
import * as calendarHandler from './handlers/calendar'
import * as formatter from './util/formatter'
import * as cron from './util/cron'
import * as taskManager from './managers/task'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api', router)
app.use('/', routerViews)

const setupTeams = async function() {
  await storeHandler.init()
  await storeHandler.setupDevTeam()

  const tokens = await storeHandler.getAllTokens()
  botHandler.resumeAllConnections(tokens)

  botHandler.listener.on('direct_message', async function(bot, message) {
    const currentListId = await storeHandler.getCurrentListId(message.user)
    await storeHandler.persistTasksFromMessageToList(currentListId, message, message.user)
    const currentListTasks = await storeHandler.fetchCurrentList(message.user)
    botHandler.sendGeneratedListForApproval(currentListTasks, currentListId, message.user)
  })

  botHandler.listener.on('ambient', (bot, message) => {
    const task = lookForCompletedTask(message.text)
    if (task !== null) {
      taskManager.checkDoneTask(task, message.user)
    }
  })
}

setupTeams()
cron.startPlanningNewDayJob()
cron.startFinishDayJob()

var port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening on ${port}`)
})
