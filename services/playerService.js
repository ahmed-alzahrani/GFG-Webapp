let config = require('../config/config.js')
let fetch = require('node-fetch')
let fs = require('fs')

exports.players = function () {
  let players = []
  var obj = JSON.parse(fs.readFileSync('Resources/Players/players.json', 'utf8'))
  for (var i = 0; i < obj.players.length; i++) {
    let player = {
      id: obj.players[i].id,
      name: obj.players[i].name,
      age: obj.players[i].age,
      position: obj.players[i].position,
      team: obj.players[i].team_id,
      teamName: obj.players[i].team,
      league: obj.players[i].league,
      number: obj.players[i].number,
      injured: obj.players[i].injured,
      appearences: obj.players[i].appearences,
      goals: obj.players[i].goals,
      assists: obj.players[i].assists,
      yellowcards: obj.players[i].yellowcards,
      redcards: obj.players[i].redcards
    }
    players.push(player)
  }
  return players
}

// fetches and returns detailed data on a specific player at a url based on that player's id
exports.player = async function (playerId) {
  let url = config.baseUrl + 'player/' + playerId + '?Authorization=' + config.apiKey
  let response = await fetch(url)
  let data = await response.json()
  return data
}
