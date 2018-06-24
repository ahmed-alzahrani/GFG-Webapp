/*
    Author/s:
    Description: This is the file that is going to include the functions that will be scheduled to be called by the server
*/

let fetch = require('node-fetch')

let config = require('../config/config.js')
let playerService = require('../services/playerService.js')
let competitionService = require('../services/competitionService.js')
let teamService = require('../services/teamService.js')

let liveMatches = [{events: []}]  // Stores live matches atm
// let url = config.baseUrl + 'matches?Authorization=' + config.apiKey
// Testing stuff
let myUrl = 'http://api.football-api.com/2.0/matches/?team_id=9259&from_date=21.06.2017&to_date=21.09.2017&Authorization=' + config.apiKey

/*
// Tester api returned for live matches for testing
let testMatch = [
  {
    'id': '1921980',
    'comp_id': '1204',
    'formatted_date': '03.01.2016',
    'season': '2015/2016',
    'week': '20',
    'venue': 'Selhurst Park (London)',
    'venue_id': '1265',
    'venue_city': 'London',
    'status': 'FT',
    'timer': 'string',
    'time': '13:30',
    'localteam_id': '9127',
    'localteam_name': 'Crystal Palace',
    'localteam_score': '0',
    'visitorteam_id': '9092',
    'visitorteam_name': 'Chelsea',
    'visitorteam_score': '3',
    'ht_score': '[0-1]',
    'ft_score': '[0-3]',
    'et_score': 'string',
    'penalty_local': 'string',
    'penalty_visitor': 'string',
    'events': [
      {
        'id': '21583632',
        'type': 'goal',
        'minute': '29',
        'extra_min': 0,
        'team': 'visitorteam',
        'player': 'Oscar',
        'player_id': '57860',
        'assist': 'D. Costa',
        'assist_id': '60977',
        'result': '[0-1]'
      }
    ]
  }
]
*/

// What will happen when a user asks for data while its being updated?

// Store pointers to the functions of the js file
module.exports =
{
  checkLiveMatches: CheckLiveMatches,
  checkTeams: CheckTeamDatabase
}

// Check for live matches should occur every 5 mins
async function CheckLiveMatches () {
  // Gotta see how the api calls are made
  console.log('checking live matches')

  // let res = await MakeApiCall(url)
  let res = await MakeApiCall(myUrl)
  console.log('result of api call:')
  console.log('-------------------')
  console.log(res)
  HandleLiveMatches(res) // Handles the live matches result
}

// Check for updating teams occurs once a day
function CheckTeamDatabase () {
  console.log('checking team database')
  competitionService.populateCompetitions() // Repopulate competitions
  playerService.populatePlayers() // Repopulate players
  teamService.populateTeams() // Repopulate teams
}

// Making an api call and returning the json object value
async function MakeApiCall (url) {
  let response = await fetch(url)
  let json = await response.json()
  return json
}

// Receives the json result and handles the possible usages of it
function HandleLiveMatches (data) {
  if (data === undefined) return // If we don't have data
  if (data.code === 404) return data.message // There are no live matches

  // We have a live match or an update to a live match
  ParseLiveMatchResult(data)  // If we have a live match being updated
  liveMatches = data  // Set to the latest data
}

// Parse info out of the live results
function ParseLiveMatchResult (data) {
  // Go through the info and update the results
  UpdateLiveMatches(data) // Update live matches remove ones that aren't live anymore
  let newEvents = UpdateEvents(data)  // Update live match events
  console.log(newEvents)
}

// Goes through live matches and removes ones that aren't
function UpdateLiveMatches (data) {
  // Check for updating live matches
  for (var i = 0; i < liveMatches.length; i++) {
    var foundMatch = false
    for (var j = 0; j < data.length; j++) {
      if (liveMatches[i].id === data[j].id) {
        foundMatch = true
        break
      }
    }
    if (!foundMatch) liveMatches.splice(i, 1)
  }
}

// Check for actual new events that have occurred in the game
function UpdateEvents (data) {
  // Check for new events
  var events = []
  var sizeDifference = 0
  // I am using the data array if something breaks then my algo for removing old matches is buggy
  for (var i = 0; i < data.lengh; i++) {
    sizeDifference = data[i].events.length - liveMatches[i].events.length // This should give us the size difference in event array size
    events.push(data[i])  // Store the live game info to be able to parse through
    events[i].events = [] // Reset events array to get most latest events
    for (var j = 0; j < sizeDifference; j++) {
      events[i].events.push(data[i].events[liveMatches.events.length + j]) // Add the new events to the array
    }
  }
  return events
}
