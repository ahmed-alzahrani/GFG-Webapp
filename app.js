let express = require('express')
const app = express()
let bodyParser = require('body-parser')
let fs = require('fs')

// let swaggerUi = require('swagger-ui-express')
// let swaggerDoc = require('./swagger.json')

let adminService = require('./services/adminService.js')
let playerService = require('./services/playerService.js')

app.use(bodyParser.json())
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// set up our routes

// Return the player json information
app.get('/player/all', function (req, res) {
  res.send(playerService.players())
})

app.get('/player/:playerId', function (req, res) {
  playerService.player(req.params.playerId).then(function (player) {
    res.send(player)
  })
})

app.get('/player/matches/:teamId', function (req, res) {
  adminService.getMatches([req.params.teamId]).then(function (matches) {
    res.send(matches)
  })
})

app.get('/countries', function (req, res) {
  var obj = JSON.parse(fs.readFileSync('Resources/Countries/countries.json', 'utf8'))
  res.send(obj.countries)
})

app.get('/charities', function (req, res) {
  var obj = JSON.parse(fs.readFileSync('Resources/Charities/charities.json', 'utf8'))
  res.send(obj.charities)
})

// USER ROUTES HERE

app.get('/user/matches/:userId', function (req, res) {
  adminService.getTeamIds(req.params.userId).then(function (ids) {
    adminService.getMatches(ids).then(function (matches) {
      res.send(matches)
    })
  })
})

app.get('/user/profile/:uid', function (req, res) {
  adminService.getProfile(req.params.uid).then(function (profile) {
    res.send(profile)
  })
})

app.post('/user/profile', function (req, res) {
  adminService.addUser(req.body).then(function (response) {
    res.send(response)
  })
})

app.put('/user/profile/:uid', function (req, res) {
  adminService.updateProfile(req.body, req.params.uid).then(function (response) {
    res.send(response)
  })
})

app.get('/user/subscriptions/:userId', function (req, res) {
  adminService.getSubscriptions(req.params.userId).then(function (response) {
    res.send(response)
  })
})

app.post('/user/subscriptions', function (req, res) {
  adminService.subscribe(req.body).then(function (response) {
    res.send(response)
  })
})

app.put('/user/subscriptions', function (req, res) {
  adminService.updateSubscription(req.body).then(function (response) {
    res.send(response)
  })
})

app.delete('/user/subscriptions', function (req, res) {
  adminService.unsubscribe(req.body).then(function (response) {
    res.send(response)
  })
})

app.get('/user/subscriptions/:user/:player', function (req, res) {
  adminService.amISubscribed(req.params.user, req.params.player).then(function (response) {
    res.send(response)
  })
})

app.get('/user/participants/:uid/:local/:visitor', function (req, res) {
  adminService.getParticipants(req.params.uid, req.params.local, req.params.visitor).then(function (participants) {
    res.send(participants)
  })
})

module.exports = app
