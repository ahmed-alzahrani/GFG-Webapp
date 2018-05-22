let express = require('express')
let app = express()
let playerService = require('./services/playerService.js')
// set up our routes
app.get('/', function (req, res) {
  res.send('hello world')
})

app.get('/team/:teamId', function (req, res) {
  let message = 'you queried for team with the id ' + req.params.teamId
  res.send(message)
})

app.get('/allPlayers', function (req, res) {
  console.log('preparing all players...')
  var players = {
    id: 'hi'
  }
  players = playerService.getPlayers()
  res.send(players)
})

app.listen(8080, function() {
  console.log('Listening on port 8080!')
})
