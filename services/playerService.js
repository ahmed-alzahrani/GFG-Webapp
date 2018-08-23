let config = require('../config/config.js')
let fetch = require('node-fetch')
let fs = require('fs')
let util = require('../util/util.js')

exports.players = function () {
  let players = []
  try {
    var obj = JSON.parse(fs.readFileSync('Resources/Players/players.json', 'utf8'))
    for (var i = 0; i < obj.players.length; i++) {
      let player = util.buildPlayer(obj.players[i])
      players.push(player)
    }
    return players
  } catch (err) {
    console.log('error trying to get players ', err)
    return players
  }
}

// fetches and returns detailed data on a specific player at a url based on that player's id
exports.player = async function (playerId) {
  let url = config.baseUrl + 'player/' + playerId + '?Authorization=' + config.apiKey
  let response = await fetch(url)
  let data = await response.json()
  return data
}
