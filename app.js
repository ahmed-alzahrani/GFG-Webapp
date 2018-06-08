let express = require('express')
let app = express()
let bodyParser = require('body-parser')

let adminService = require('./services/adminService.js')
let playerService = require('./services/playerService.js')
let charitiesService = require('./services/charitiesService.js')

let scheduler = require('node-schedule');                     // This will be the scheduler that sets up function calls at certain time intervals 
let scheduleFuncs = require('./services/scheduleService.js'); // This holds the functions that will be scheduled by the scheduler

// These will be removed later the hold the scheduled jobs
let j;
let j1;

app.use(bodyParser.json())

// set up our routes
app.get('/', function (req, res) {
  res.send('hello world')
})

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

app.post('/addUser', function (req, res) {
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

app.post('/unsubscribe', function (req, res) {
  adminService.unsubscribe(req.body).then(function (response) {
    res.send(response)
  })
})

app.listen(8080, function () {
  console.log('Listening on port 8080!')

  var rule = new scheduler.RecurrenceRule();
  rule.hour = 2;        // Should run at 2 am all the time
  rule.minute = 0;      // We have to set minute to 0 or this will run every minute at 2 am 

  j = scheduler.scheduleJob(rule , scheduleFuncs.checkTeams);                       // Schedules the check for team values in the database
  j1 = scheduler.scheduleJob('*/5 * * * *' , scheduleFuncs.checkLiveMatches);       // Schedules the check for checking for live matches
})
