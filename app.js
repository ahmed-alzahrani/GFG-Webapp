let express = require('express')
let app = express()

let playerService = require('./services/playerService.js')
let charitiesService = require('./services/charitiesService.js')
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

app.listen(8080, function () {
  console.log('Listening on port 8080!')
})
