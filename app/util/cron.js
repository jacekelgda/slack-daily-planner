import cron from 'node-cron'

function startJob(job) {
  cron.schedule('* * * * *', () => {
    job()
  });
}

export { startJob }
