let express = require('express')
let app = express()
let router = express.Router()
let playerService = require('./services/playerService.js')
// set up our routes
app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/allPlayers', function (req, res) {
  res.send(playerService.getPlayers())
})

app.get('/createPlayer/:playerId', function (req, res) {
  playerService.populatePlayer(req.params.playerId)
  res.send('successfull creation!')
})

app.get('/getPlayer/:playerId', function (req, res) {
  res.send(playerService.getPlayer(req.params.playerId))
})

app.listen(8080, function() {
  console.log('Listening on port 8080!')
})
