import cron from 'node-cron'

const startJob = (job) => {
  cron.schedule(process.env.cron_interval, () => {
    job()
  })
}

export { startJob }
