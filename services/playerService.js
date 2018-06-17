let config = require('../config/config.js')
let fetch = require('node-fetch')
let fs = require('fs')
let teamStore = require('json-fs-store')('./Resources/Teams')
let playerStore = require('json-fs-store')('./Resources/Players')

exports.populatePlayers = function () {
  createPlayers()
}

// Might need to make changes here to receive directories
exports.players = function (directory) {
  // var obj = JSON.parse(fs.readFileSync('Resources/Players/players.json', 'utf8'))
  var obj = JSON.parse(fs.readFileSync(directory, 'utf8'))
  return obj.players
}

// fetches and returns detailed data on a specific player at a url based on that player's id
exports.player = async function (playerId) {
  let url = config.baseUrl + 'player/' + playerId + '?Authorization=' + config.apiKey
  let response = await fetch(url)
  let data = await response.json()
  return data
}

// loops through the squads held in /Resources/Teams and writes info for each player at /Resources/Players
function createPlayers () {
  let playerArr = []
  teamStore.list(function (err, objects) {
    if (err) throw err
    for (var i = 0; i < objects.length; i++) {
    // we extract info that we want accesible to our player from the teams
      let squad = objects[i].squad
      let teamName = objects[i].id
      let teamId = objects[i].team_id
      let league = objects[i].league
      for (var x = 0; x < squad.length; x++) {
        let player = squad[x]

        // edit some player info before we add it to our array
        adjustPosition(player)
        player.team = teamName
        player.team_id = teamId
        player.league = league
        playerArr.push(player)
      }
    }
    // send the player array to be written in JSON in the proper Resource folder
    let obj = {
      id: 'players',
      players: playerArr
    }
    playerStore.add(obj, function (err) { if (err) throw err })
    console.log('number of players is... ' + playerArr.length)
  })
}

// maps positions as they arrive from the live feed to how we want them returned to the client
function adjustPosition (player) {
  switch (player.position) {
    case 'G':
      player.position = 'Goalkeeper'
      break

    case 'D':
      player.position = 'Defender'
      break

    case 'M':
      player.position = 'Midfielder'
      break

    case 'A':
      player.position = 'Attacker'
      break
  }
}
