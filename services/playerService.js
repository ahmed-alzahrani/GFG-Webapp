let config = require('../config/config.js')
var rp = require('request-promise')
let fs = require('fs')
let teamStore = require('json-fs-store')('./Resources/Teams')
let playerStore = require('json-fs-store')('./Resources/Players')


exports.populatePlayers = function() {
  createPlayers()
}

exports.getPlayers = function() {
  var obj = JSON.parse(fs.readFileSync('Resources/Players/players.json', 'utf8'))
  return obj.players
}

exports.populatePlayer = function(playerId) {
  console.log('the call to populate player has been made... about to trigger the internal createPlayer()....')
   createPlayer(playerId)
}

exports.getPlayer = function(playerId) {
  console.log('... I am inside playerService.getPlayer(), about to trigger the internal getPlayerDetails()...')
  return getPlayerDetails(playerId)
}

function getPlayerDetails(playerId) {
  console.log('About to try read the written JSON object')
  let objPath = 'Resources/Players/' + playerId + '.json'
  var obj = JSON.parse(fs.readFileSync(objPath, 'utf8'))
  return obj
}

function createPlayer(playerId) {
  console.log('I am inside the createPlayer internally... about to make the url req...')
  let url = config.baseUrl + 'player/' + playerId + "?Authorization=" + config.apiKey
  rp({
    "method": "GET",
    "uri": url,
    "json": true
  }).then(function (response) {
    console.log('about to try write the response to the call for the detailed player...')
    let obj = {
      id: playerId,
      player: response
    }
    playerStore.add(obj, function(err) {
      if (err) throw err
      console.log('the player file has been written')
    })
  })

}


function createPlayers() {
  logBeginning()

let playerArr = []
teamStore.list(function(err, objects) {
  if (err) throw err
  for (var i = 0; i < objects.length; i++) {
    // we extract info that we want accesible to our player from the teams
    let squad = objects[i].squad
    let teamName = objects[i].id
    let team_id = objects[i].team_id
    let league = objects[i].league
    for (var x = 0; x < squad.length; x++) {
      let player = squad[x]

      // edit some player info before we add it to our array
      adjustPosition(player)
      player.team = teamName
      player.team_id = team_id
      player.league = league
      playerArr.push(player)
    }
  }
  // send the player array to be written in JSON in the proper Resource folder
  writePlayers(playerArr)
  console.log('number of players is... ' + playerArr.length)
})
}


function adjustPosition(player) {
  switch (player.position) {
    case "G":
      player.position = "Goalkeeper"
      break

    case "D":
      player.position = "Defender"
      break

    case "M":
      player.position = "Midfielder"
      break

    case "A":
      player.position = "Attacker"
      break
  }
}

function writePlayers(playerArr) {
  let obj = {
    id: 'players',
    players: playerArr
  }
  playerStore.add(obj, function (err) { if (err) throw err })
}

function logBeginning() {
  console.log()
  console.log()
  console.log('attemptin to recover the files from the Teams directory in resources')
  console.log()
  console.log()
}
