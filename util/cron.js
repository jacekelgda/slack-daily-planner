import cron from 'node-cron'
import { startPlanningNewDay, finishDay } from '../managers/task'

const startPlanningNewDayJob = () => {
  cron.schedule(process.env.start_day_interval, () => {
    startPlanningNewDay()
  })
}

const startFinishDayJob = () => {
  cron.schedule(process.env.finish_day_interval, () => {
    finishDay()
  })
}

export {
  startPlanningNewDayJob,
  startFinishDayJob
}
