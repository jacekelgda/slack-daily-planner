import * as chatHandler from './handlers/chatHandler'
import * as storageHandler from './handlers/storageHandler'
import * as calendarHandler from './handlers/calendarHandler'
import * as formatter from './util/formatter'
import router from './controllers'

import bodyParser from 'body-parser'
import localtunnel from 'localtunnel'
import express from 'express'

const app = express()


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api', router);

chatHandler.listener.on('direct_message', async function(bot, message) {
  const currentListId = await storageHandler.getCurrentListId()
  const updatedList = await storageHandler.persistTasksFromMessageToList(currentListId, message)
  const currentListTasks = await storageHandler.fetchCurrentList()

  chatHandler.sendGeneratedListForApproval(currentListTasks)
})

async function startPlanningNewDay() {
  const listId = Date.now()

  const auth = await calendarHandler.authorize()
  const calendarEvents = await calendarHandler.listEvents(auth)
  const responseMessage = await chatHandler.startPrivateConversation(listId)

  const events = formatter.processCalendarEvents(calendarEvents)
  const tasks = formatter.processMessage(responseMessage)

  const newList = await storageHandler.createNewTasksList(listId, events.concat(tasks))
  const currentList = await storageHandler.fetchList(listId)

  chatHandler.sendInteractiveMessageAsNewConversation(currentList)
}

startPlanningNewDay()

var port = process.env.PORT || 3000
app.listen(port)

if (!process.env.is_prod) {
  const opts = { subdomain:process.env.localtunnel_subdomain }
  const tunnel = localtunnel(port, opts, (err, tunnel) => {
      console.log('localtunnel url:', tunnel.url)
  })
}
