import * as botHandler from '..//handlers/bot'
import * as storeHandler from '../handlers/store'
import * as calendarHandler from '../handlers/calendar'
import * as formatter from '../util/formatter'

const checkDoneTask = async function(task, userId) {
  let currentListTasks = await storeHandler.fetchCurrentList(userId)
  currentListTasks.forEach(async function(item, index) {
    if (item.name == task) {
      const currentListId = await storeHandler.getCurrentListId(userId)
      item.achieved = true
      storeHandler.markTaskAchieved(currentListId, index, item, userId)
      currentListTasks = await storeHandler.fetchCurrentList(userId)
      let list = formatter.generateList(currentListTasks)
      list = formatter.formatListToSlackText(list)
      let listMeta = await storeHandler.getListMetadata(currentListId, userId)
      if (listMeta.ts && listMeta.channel) {
        botHandler.updateMessageInJournal(listMeta.ts, list, listMeta.channel, userId)
      }
    }
  })
}

const startPlanningNewDay = () => {
  const listId = Date.now()
  // const oauth2Client = await calendarHandler.authorize(token)
  // const calendarEvents = await calendarHandler.listEvents(oauth2Client)
  botHandler.initDailyPlan(listId)
  // const events = formatter.processCalendarEvents(calendarEvents)

  // const currentList = await storeHandler.fetchList(listId)

}

const finishDay = () => {
  const listId = Date.now()
  botHandler.initDailySumUp(listId)
}

export {
  checkDoneTask,
  startPlanningNewDay,
  finishDay,
}
