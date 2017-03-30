import * as chatHandler from './handlers/chatHandler'
import * as storageHandler from './handlers/storageHandler'
import * as calendarHandler from './handlers/calendarHandler'
import * as formatter from './util/formatter'

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
