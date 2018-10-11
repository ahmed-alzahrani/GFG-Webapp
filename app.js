let express = require('express')
const app = express()
let bodyParser = require('body-parser')
let VerifyToken = require('./auth/VerifyToken.js')

let swaggerUi = require('swagger-ui-express')
let swaggerDoc = require('./documentation/swagger/swagger.json')

let adminService = require('./services/adminService.js')

let authController = require('./auth/AuthController.js')
app.use('/auth', authController)

app.use(bodyParser.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// set up our routes

// Return the player json information
app.get('/player/all', VerifyToken, function (req, res) {
  var response = []
  adminService.db.collection('squads').get().then(snapshot => {
    snapshot.forEach(doc => {
      for (var i = 0; i < doc.data().squad.length; i++) {
        var obj = doc.data().squad[i]
        obj.teamName = doc.data().name
        obj.teamId = doc.id
        response.push(obj)
      }
    })
    res.status(200).send(response)
  }).catch(err => {
    res.status(500).send('error getting players: ', err)
  })
})

app.get('/player/:playerId', VerifyToken, function (req, res) {
  var exists = false
  adminService.db.collection('squads').get().then(snapshot => {
    snapshot.forEach(doc => {
      for (var i = 0; i < doc.data().squad.length; i++) {
        if (doc.data().squad[i].id === req.params.playerId) {
          exists = true
          var obj = doc.data().squad[i]
          obj.teamName = doc.data().name
          obj.teamId = doc.id
          res.status(200).send(obj)
        }
      }
    })
    if (!exists) res.status(404).send('player not found')
  }).catch(err => {
    console.log('error getting players: ', err)
  })
})

app.get('/player/matches/:teamId', VerifyToken, function (req, res) {
  adminService.getMatches([req.params.teamId]).then(function (matches) {
    if (matches.length > 0) {
      res.status(200).send(matches)
    } else {
      res.status(404).send()
    }
  })
})

app.get('/countries', VerifyToken, function (req, res) {
  var response = []
  adminService.db.collection('countries').get().then(snapshot => {
    snapshot.forEach(doc => {
      response.push({id: doc.id, name: doc.data().name})
    })
    res.status(200).send(response)
  }).catch(err => {
    res.status(500).send('error getting countries: ', err)
  })
})

app.get('/charities', VerifyToken, function (req, res) {
  var response = []
  adminService.db.collection('charities').get().then(snapshot => {
    snapshot.forEach(doc => {
      response.push(doc.data())
    })
    res.status(200).send(response)
  }).catch(err => {
    res.status(500).send('error getting charities: ', err)
  })
})

app.delete('/user/profile', VerifyToken, function (req, res) {
  adminService.deleteProfile(req.userId).then(function (result) {
    res.sendStatus(result)
  })
})

app.put('/user/profile', VerifyToken, function (req, res) {
  adminService.updateProfile(req.body, req.userId).then(function (response) {
    if (response.code === 200) {
      res.status(200).send(response.response)
    } else {
      console.log('404')
      res.sendStatus(404)
    }
  })
})

app.get('/user/subscriptions', VerifyToken, function (req, res) {
  adminService.subscriptions(req.userId).then(function (response) {
    if (response.length > 0) {
      res.status(200).send(response)
    } else {
      res.sendStatus(404)
    }
  })
})

app.post('/user/subscriptions', VerifyToken, function (req, res) {
  adminService.subscribe(req.body, req.userId).then(function (response) {
    res.status(response).send()
  })
})

// this route is the current one im working on
app.put('/user/subscriptions', VerifyToken, function (req, res) {
  adminService.updateSubscription(req.body, req.userId).then(function (response) {
    res.sendStatus(response)
  })
})

app.delete('/user/subscriptions', VerifyToken, function (req, res) {
  adminService.unsubscribe(req.body, req.userId).then(function (response) {
    res.sendStatus(response)
  })
})

app.get('/user/subscriptions/:player', VerifyToken, function (req, res) {
  adminService.amISubscribed(req.userId, req.params.player).then(function (response) {
    if (response === 404) {
      res.sendStatus(response)
    } else {
      res.status(200).send(response)
    }
  })
})

app.get('/user/matches', VerifyToken, function (req, res) {
  adminService.getTeamIds(req.userId).then(function (ids) {
    adminService.getMatches(ids).then(function (matches) {
      res.send(matches)
    })
  })
})

app.get('/user/participants/:local/:visitor', VerifyToken, function (req, res) {
  adminService.participants(req.userId, req.params.local, req.params.visitor).then(function (participants) {
    res.send(participants)
  })
})

module.exports = app
