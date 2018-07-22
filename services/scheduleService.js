let fetch = require('node-fetch')
let config = require('../config/config.js')
let playerService = require('../services/playerService.js')
let competitionService = require('../services/competitionService.js')
let teamService = require('../services/teamService.js')
let adminService = require('../services/adminService.js')
let fs = require('fs')
let matchesStore = require('json-fs-store')('./Resources/Matches')
// let url = config.baseUrl + 'matches?Authorization=' + config.apiKey
let url = 'http://api.football-api.com/2.0/matches/?team_id=9259&from_date=21.06.2017&to_date=21.09.2017&Authorization=' + config.apiKey

// Store pointers to the functions of the js file
module.exports =
{
  checkLiveMatches: CheckLiveMatches,
  checkTeams: CheckTeams
}

// Check for updating teams occurs once a day
function CheckTeams () {
  console.log('checking team database')
  competitionService.populateCompetitions() // Repopulate competitions
  teamService.populateTeams() // Repopulate teams
  playerService.populatePlayers() // Repopulate players
}

// Check for live matches should occur every 5 mins

async function CheckLiveMatches () {
  console.log('checking live matches')
  let res = await MakeApiCall(url) // gets the raw live match JSON data
  HandleLiveMatches(res) // Handles the live matches result
}

// Making an api call and returning the json object value

async function MakeApiCall (url) {
  let response = await fetch(url)
  let json = await response.json()
  return json
}

// Receives the json result and handles the possible usages of it

function HandleLiveMatches (data) {
  if (data === undefined) {
    console.log('no new data to report')
    return // If we don't have data
  }
  if (data.code === 404) {
    console.log('got a 404 back')
    let obj = {
      id: 'matches',
      matches: []
    }
    matchesStore.add(obj, function (err) {
      if (err) throw err
      else {
        console.log('successfully reset live matches to an empty array!')
      }
    })
    return data.message
  }
  RemoveDeprecatedMatches(data)
  UpdateLiveMatches(data)
}

function RemoveDeprecatedMatches (data) {
  var matches = JSON.parse(fs.readFileSync('Resources/Matches/matches.json', 'utf8')).matches
  for (var i = 0; i < matches.length; i++) {
    var live = false
    for (var j = 0; j < data.length; j++) {
      if (matches[i].id === data[j].id) {
        live = true
        break
      }
    }
    if (!live) {
      matches.pop(matches[i])
      i -= 1
    }
  }
  let obj = {
    id: 'matches',
    matches: matches
  }
  matchesStore.add(obj, function (err) {
    if (err) throw err
    else {
      console.log('successfully trimmed deprecated matches')
    }
  })
}

// Goes through live matches and removes ones that aren't
function UpdateLiveMatches (data) {
  var matches = JSON.parse(fs.readFileSync('Resources/Matches/matches.json', 'utf8')).matches
  for (var i = 0; i < data.length; i++) {
    var exists = false
    for (var j = 0; j < matches.length; j++) {
      if (data[i].id === matches[j].id) {
        exists = true
        break
      }
    }
    if (!exists) matches.push(trimMatch(data[i]))
  }
  let obj = {
    id: 'matches',
    matches: matches
  }
  matchesStore.add(obj, function (err) {
    if (err) throw err
    else {
      console.log('successfully updated live matches!')
      UpdateEvents(data)
    }
  })
}

// Check for actual new events that have occurred in the game
function UpdateEvents (data) {
  var matches = JSON.parse(fs.readFileSync('Resources/Matches/matches.json', 'utf8'))
  matches = matches.matches

  for (var i = 0; i < data.length; i++) {
    let liveMatchId = data[i].id
    let events = data[i].events
    for (var j = 0; j < matches.length; j++) {
      if (matches[i].id === liveMatchId) {
        matches[i].events = ParseEvents(matches[i].events, events)
      }
    }
  }
  let obj = {
    id: 'matches',
    matches: matches
  }
  matchesStore.add(obj, function (err) {
    if (err) throw err
    else {
      console.log('successfully updated live match events!')
    }
  })
}

function ParseEvents (storedEvents, events) {
  for (var i = 0; i < events.length; i++) {
    var exists = false
    for (var j = 0; j < storedEvents.length; j++) {
      if (events[i].id === storedEvents[j].id) {
        exists = true
        break
      }
    }
    if (!exists && events[i].type === 'goal') {
      storedEvents.push(trimEvent(events[i]))
      adminService.handleGoal(events[i].player_id)
      // a new goal exists! send it to the event and trigger the call for goals
    }
  }
  return storedEvents
}

function trimMatch (match) {
  let obj = {
    id: match.id,
    comp_id: match.comp_id,
    venue: match.venue,
    home: match.localteam_name,
    away: match.visitorteam_name,
    events: []
  }
  // console.log('I just trimmed a match... let me look at what that looks like')
  // console.log(obj)
  return obj
}

function trimEvent (matchEvent) {
  let obj = {
    id: matchEvent.id,
    type: matchEvent.type,
    minute: matchEvent.minute,
    team: matchEvent.team,
    player: matchEvent.player,
    playerId: matchEvent.player_id,
    result: matchEvent.result
  }

  return obj
}
