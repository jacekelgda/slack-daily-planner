import * as botHandler from '..//handlers/bot'
import * as storeHandler from '../handlers/store'
import * as calendarHandler from '../handlers/calendar'
import * as formatter from '../util/formatter'

const checkDoneTask = async function(task) {
  let currentListTasks = await storeHandler.fetchCurrentList()
  currentListTasks.forEach(async function(item, index) {
    if (item.name == task) {
      const currentListId = await storeHandler.getCurrentListId()
      item.achieved = true
      storeHandler.markTaskAchieved(currentListId, index, item)
      currentListTasks = await storeHandler.fetchCurrentList()
      let list = formatter.generateList(currentListTasks)
      list = formatter.formatListToSlackText(list)
      let listMeta = await storeHandler.getListMetadata(currentListId)
      if (listMeta.ts && listMeta.channel) {
        botHandler.updateMessageInJournal(listMeta.ts, list, listMeta.channel)
      }
    }
  })
}

const startPlanningNewDay = async function() {
  const listId = Date.now()

  // const oauth2Client = await calendarHandler.authorize(token)
  // const calendarEvents = await calendarHandler.listEvents(oauth2Client)
  const responseMessage = await botHandler.startPrivateConversation(listId)
  // const events = formatter.processCalendarEvents(calendarEvents)

  // const currentList = await storeHandler.fetchList(listId)

}

export {
  checkDoneTask,
  startPlanningNewDay,
}
