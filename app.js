let express = require('express')
const app = express()
let bodyParser = require('body-parser')
let fs = require('fs')

let swaggerUi = require('swagger-ui-express')
let swaggerDoc = require('./swagger/swagger.json')

let adminService = require('./services/adminService.js')
let playerService = require('./services/playerService.js')

app.use(bodyParser.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// set up our routes

// Return the player json information
app.get('/player/all', function (req, res) {
  let players = playerService.players()
  if (players.length > 0) {
    res.status(200).send(players)
  } else {
    res.sendStatus(500)
  }
})

app.get('/player/:playerId', function (req, res) {
  playerService.player(req.params.playerId).then(function (player) {
    res.send(player)
  })
})

app.get('/player/matches/:teamId', function (req, res) {
  adminService.getMatches([req.params.teamId]).then(function (matches) {
    if (matches.length > 0) {
      res.status(200).send(matches)
    } else {
      res.sendStatus(404)
    }
  })
})

app.get('/countries', function (req, res) {
  try {
    var obj = JSON.parse(fs.readFileSync('Resources/Countries/countries.json', 'utf8'))
    res.status(200).send(obj.countries)
  } catch (err) {
    console.log('error retrieving countries: ', err)
    res.sendStatus(500)
  }
})

app.get('/charities', function (req, res) {
  try {
    var obj = JSON.parse(fs.readFileSync('Resources/Charities/charities.json', 'utf8'))
    res.status(200).send(obj.charities)
  } catch (err) {
    console.log('error retrieving charities: ', err)
    res.sendStatus(500)
  }
})

app.get('/user/profile/:uid', function (req, res) {
  adminService.getProfile(req.params.uid).then(function (profile) {
    if (profile.code === 404) {
      res.sendStatus(404)
    } else {
      res.status(200).send(profile)
    }
  })
})

app.delete('/user/profile/:uid', function (req, res) {
  adminService.deleteProfile(req.params.uid).then(function (result) {
    console.log('rerturning result of profile deletion: ', result)
    res.sendStatus(result)
  })
})

app.put('/user/profile/:uid', function (req, res) {
  adminService.updateProfile(req.body, req.params.uid).then(function (response) {
    if (response.code === 200) {
      res.status(200).send(response.response)
    } else {
      console.log('404')
      res.sendStatus(404)
    }
  })
})

app.post('/user/profile', function (req, res) {
  adminService.addUser(req.body).then(function (response) {
    res.sendStatus(response)
  })
})

app.get('/user/subscriptions/:userId', function (req, res) {
  adminService.subscriptions(req.params.userId).then(function (response) {
    if (response.length > 0) {
      res.status(200).send(response)
    } else {
      res.sendStatus(404)
    }
  })
})

app.post('/user/subscriptions', function (req, res) {
  adminService.subscribe(req.body).then(function (response) {
    res.sendStatus(response)
  })
})

// this route is the current one im working on
app.put('/user/subscriptions', function (req, res) {
  adminService.updateSubscription(req.body).then(function (response) {
    res.sendStatus(response)
  })
})

app.delete('/user/subscriptions', function (req, res) {
  adminService.unsubscribe(req.body).then(function (response) {
    res.sendStatus(response)
  })
})

app.get('/user/subscriptions/:user/:player', function (req, res) {
  adminService.amISubscribed(req.params.user, req.params.player).then(function (response) {
    if (response === 404) {
      res.sendStatus(response)
    } else {
      res.status(200).send(response)
    }
  })
})

app.get('/user/matches/:userId', function (req, res) {
  adminService.getTeamIds(req.params.userId).then(function (ids) {
    adminService.getMatches(ids).then(function (matches) {
      res.send(matches)
    })
  })
})

app.get('/user/participants/:uid/:local/:visitor', function (req, res) {
  adminService.participants(req.params.uid, req.params.local, req.params.visitor).then(function (participants) {
    res.send(participants)
  })
})

module.exports = app
