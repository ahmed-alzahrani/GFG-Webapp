let express = require('express')
let app = express()
let bodyParser = require('body-parser')

let adminService = require('./services/adminService.js')
let playerService = require('./services/playerService.js')
let charitiesService = require('./services/charitiesService.js')

app.use(bodyParser.json())

// set up our routes
app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/allPlayers', function (req, res) {
  res.send(playerService.getPlayers())
})

app.get('/getPlayer/:playerId', function (req, res) {
  playerService.getPlayer(req.params.playerId).then(function (player) {
    res.send(player)
  })
})

app.get('/charities', function (req, res) {
  res.send(charitiesService.getCharities())
})

app.post('/addUser', function (req, res) {
  adminService.postUser(req.body).then(function (token) {
    res.send(token)
  })
})

app.listen(8080, function () {
  console.log('Listening on port 8080!')
})
