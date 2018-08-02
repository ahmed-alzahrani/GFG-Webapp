let express = require('express')
let app = express()
let bodyParser = require('body-parser')

let adminService = require('./services/adminService.js')
let playerService = require('./services/playerService.js')
let charitiesService = require('./services/charitiesService.js')
let cron = require('cron')
let scheduleService = require('./services/scheduleService.js') // This holds the functions that will be scheduled by the scheduler

app.use(bodyParser.json())

// set up our routes

// Return the player json information
app.get('/players', function (req, res) {
  res.send(playerService.players())
})

app.get('/player/:playerId', function (req, res) {
  playerService.player(req.params.playerId).then(function (player) {
    res.send(player)
  })
})

app.get('/charities', function (req, res) {
  res.send(charitiesService.charities())
})

app.get('/subscriptions/:userId', function (req, res) {
  adminService.getSubscriptions(req.params.userId).then(function (response) {
    res.send(response)
  })
})

app.get('/matches/:userId', function (req, res) {
  adminService.getTeamIds(req.params.userId).then(function (ids) {
    adminService.getMatches(ids).then(function (matches) {
      res.send(matches)
    })
  })
})

app.get('/playerMatches/:teamId', function (req, res) {
  adminService.getMatches([req.params.teamId]).then(function (matches) {
    res.send(matches)
  })
})

app.get('/stats/:uid', function (req, res) {
  adminService.getStats(req.params.uid).then(function (stats) {
    res.send(stats)
  })
})

// adds a user to the Firebase Firestore in order to track their subscriptions and goals
app.post('/addUser', function (req, res) {
  console.log('lets look at the req... ')
  console.log(req.body)
  adminService.addUser(req.body).then(function (response) {
    res.send(response)
  })
})

app.post('/amISubscribed', function (req, res) {
  adminService.amISubscribed(req.body).then(function (response) {
    res.send(response)
  })
})

app.post('/subscribe', function (req, res) {
  adminService.subscribe(req.body).then(function (response) {
    res.send(response)
  })
})

app.post('/updateSubscription', function (req, res) {
  adminService.updateSubscription(req.body).then(function (response) {
    res.send(response)
  })
})

app.post('/unsubscribe', function (req, res) {
  adminService.unsubscribe(req.body).then(function (response) {
    res.send(response)
  })
})

app.listen(8080, function () {
  console.log('Listening on port 8080!')

  let liveMatchesJob = new cron.CronJob('0 */20 * * * *', scheduleService.checkLiveMatchs)
  let teamsJob = new cron.CronJob('0 0 2 * * *', scheduleService.checkTeams)

  liveMatchesJob.start()
  teamsJob.start()
})
