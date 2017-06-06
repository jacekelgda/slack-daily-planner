import bodyParser from 'body-parser'
import express from 'express'

import router from './controllers'
import routerViews from './views'

import * as botHandler from './handlers/bot'
import * as storeHandler from './handlers/store'
import * as calendarHandler from './handlers/calendar'
import * as formatter from './util/formatter'
import * as textInterpreter from './util/textInterpreter'
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

  // botHandler.listener.on('direct_message', async function(bot, message) {
  //   const currentListId = await storeHandler.getCurrentListId()
  //   const updatedList = await storeHandler.persistTasksFromMessageToList(currentListId, message)
  //   const currentListTasks = await storeHandler.fetchCurrentList()
  //
  //   botHandler.sendGeneratedListForApproval(currentListTasks, currentListId)
  // })
  //
  // botHandler.listener.on('ambient', (bot, message) => {
  //   const task = textInterpreter.lookForCompletedTask(message.text)
  //   if (task !== null) {
  //     taskManager.checkDoneTask(task)
  //   }
  // })
}

setupTeams()
cron.startJob(taskManager.startPlanningNewDay)

var port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening on ${port}`)
})
