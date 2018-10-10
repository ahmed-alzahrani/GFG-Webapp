const app = require('./app')
let cron = require('cron')
let scheduleService = require('./services/scheduleService.js')

app.listen(8080, function () {
  console.log('Listening on port 8080!')

  let liveMatchesJob = new cron.CronJob('0 */55 * * * *', scheduleService.checkLiveMatches)
  let teamsJob = new cron.CronJob('0 0 2 * * *', scheduleService.checkTeams)

  liveMatchesJob.start()
  teamsJob.start()
})
