let fetch = require('node-fetch')
let config = require('../config/config.js')
let build = require('../prestart/build.js')
let admin = require('../services/adminService.js')
let fs = require('fs')
let mailService = require('../services/mailService.js')
let matchesStore = require('json-fs-store')('./Resources/Matches')
// let url = config.baseUrl + 'matches?Authorization=' + config.apiKey // <--- URL for actual live matches
let url = 'http://api.football-api.com/2.0/matches/?team_id=9406&from_date=21.06.2017&to_date=21.09.2017&Authorization=' + config.apiKey // url for testing specific string of spurs games during dev

let db = admin.db

// Check for updating teams occurs once a day
exports.checkTeams = function () {
  console.log('checking team database')
  build.build()
}

// Check for live matches should occur every 5 mins

exports.checkLiveMatches = async function () {
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
  console.log('lets see the stored events: ', storedEvents)
  console.log()
  console.log('lets see the events: ', events)
  var newGoals = []
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
      newGoals.push(trimEvent(events[i]))
      // a new goal exists! send it to the event and trigger the call for goal
      handleGoal(events[i].player_id)
    }
  }
  // here i have all the new goals
  console.log(newGoals.length)
  // how can I handle new goals here
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

async function handleGoal (playerId) {
  var ref = db.collection('users')
  ref.get().then(snapshot => {
    snapshot.forEach(user => {
      if (playerId === '') {
        playerId = 'empty'
      }
      var subscriptionRef = db.collection('users').doc(user.id).collection('subscriptions').doc(playerId)
      subscriptionRef.get().then(function (subscription) {
        if (subscription.exists) {
          let newGoals = subscription.data().goals + 1
          subscriptionRef.update({
            goals: newGoals
          })
          let stats = updateStats(user.data().stats, subscription.data(), playerId)
          ref.doc(user.id).update({ stats: stats })
          mailService.sendGoalEmail(user.data().email, subscription.data().charity, subscription.data().name)
        } else {
        }
      })
    })
  })
    .catch(err => {
      console.log('Error getting all users', err)
    })
}

function updateStats (stats, subscription, playerId) {
  // time stamp of goal being added
  let timestamp = new Date()
  let timeString = timestamp.toString()
  // extract existing stat info to update with
  let charity = subscription.charityId
  var goals = stats.goals + 1
  var allGoals = stats.allGoals
  var charities = stats.charities
  var scorers = stats.scorers

  // add the new goal into the allGoals array
  allGoals.push({
    charityName: subscription.charity,
    charity: charity,
    player: playerId,
    playerName: subscription.name,
    teamName: subscription.teamName,
    team: subscription.team,
    time: timeString
  })

  // update charities / scorers with the new goal information
  var exists = false
  for (var i = 0; i < charities.length; i++) {
    if (charities[i].id === charity) {
      charities[i].count += 1
      exists = true
      break
    }
  }
  if (!exists) {
    charities.push({
      id: charity,
      name: subscription.charity,
      count: 1
    })
  }

  exists = false
  for (i = 0; i < scorers.length; i++) {
    if (scorers[i].id === playerId) {
      scorers[i].count += 1
      exists = true
      break
    }
  }

  if (!exists) {
    scorers.push({
      id: playerId,
      name: subscription.name,
      count: 1
    })
  }
  charities.sort(findTop)
  scorers.sort(findTop)

  // return the obj
  return {
    goals: goals,
    allGoals: allGoals,
    charities: charities,
    scorers: scorers,
    topScorer: scorers[0].name,
    topCharity: charities[0].name
  }
}

function findTop (a, b) {
  if (a.count === b.count) {
    return a.name.localeCompare(b.name)
  } else {
    return a.count - b.count
  }
}
