import * as chatHandler from './handlers/chatHandler'
import * as storageHandler from './handlers/storageHandler'
import * as calendarHandler from './handlers/calendarHandler'

chatHandler.listener.on('direct_message', async function(bot, message) {
  console.log('Direct message event ...')
  let currentListId = await storageHandler.getCurrentListId()
  let updatedList = await storageHandler.persistTasksFromMessageToList(currentListId, message)
  let currentListTasks = await storageHandler.fetchCurrentList()
  chatHandler.sendGeneratedListForApproval(currentListTasks)
})

async function startPlanningNewDay() {
  const listId = Date.now()

  let auth = await calendarHandler.authorize()
  let calendarEvents = await calendarHandler.listEvents(auth)
  console.log('calendar events:', calendarEvents)
  let responseMessage = await chatHandler.startPrivateConversation(listId)
  let newList = await storageHandler.createNewTasksList(listId, responseMessage)
  let currentList = await storageHandler.fetchList(listId)
  chatHandler.sendInteractiveMessageAsNewConversation(currentList)
}

startPlanningNewDay()
