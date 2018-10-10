let config = require('../config/config.js')
let fetch = require('node-fetch')
let fs = require('fs')
let ProgressBar = require('progress')
let adminService = require('../services/adminService.js')

let ids = config.competitionIds
var squadCount = 0
var teamCount = 0

exports.build = function () {
  createCharities()
}

function createCharities () {
  let charities = JSON.parse(fs.readFileSync('config/charities.json', 'utf8'))
  for (var i = 0; i < charities.length; i++) {
    adminService.db.collection('charities').doc(charities[i].id).set(charities[i]).then(function () {
    }).catch(function (err) {
      if (err) throw err
    })
  }
  buildCountries()
}

async function buildCountries () {
  let url = 'https://restcountries.eu/rest/v2/all'
  let response = await fetch(url)
  let data = await response.json()
  for (var i = 0; i < data.length; i++) {
    if (data[i].name.length <= 40 && data[i].numericCode != null) { // adjust length of countries here
      adminService.db.collection('countries').doc(data[i].numericCode).set({name: data[i].name})
    }
  }

  buildCompetitions()
}

async function buildCompetitions () {
  let url = config.baseUrl + 'competitions?Authorization=' + config.apiKey
  let response = await fetch(url)
  let data = await response.json()

  console.log('competition data is: ')
  console.log(data)

  for (var i = 0; i < data.length; i++) {
    adminService.db.collection('competitions').doc(data[i].id).set(data[i]).then(function () {
    }).catch(function (err) {
      if (err) throw err
    })
  }

  buildStandings(data)
}

async function buildStandings (data) {
  var bar = new ProgressBar('Populating Leagues: :bar :percent', { total: ids.length })
  var count = 0
  for (var i = 0; i < data.length; i++) {
    let competition = data[i]
    if (ids.indexOf(competition.id) > -1) {
      // util.adjustCompName(competition)
      let url = config.baseUrl + 'standings/' + competition.id + '?Authorization=' + config.apiKey
      let res = await fetch(url)
      let json = await res.json()

      for (var x = 0; x < json.length; x++) {
        adminService.db.collection('standings').doc(competition.id).set({name: competition.name})
        adminService.db.collection('standings').doc(competition.id).collection('teams').doc(json[x].team_id).set(json[x])
        teamCount += 1
      }
      count += 1
      bar.tick()
      if (count === ids.length) {
        buildTeams()
      }
    }
  }
}

async function buildTeams () {
  var bar = new ProgressBar('Populating Teams: :bar :percent', { total: teamCount })
  var standingsRef = adminService.db.collection('standings')
  standingsRef.get().then(snapshot => {
    snapshot.forEach(doc => {
      var teamsRef = adminService.db.collection('standings').doc(doc.id).collection('teams')
      teamsRef.get().then(snapshot => {
        snapshot.forEach(doc => {
          let url = config.baseUrl + 'team/' + doc.id + '?Authorization=' + config.apiKey
          writeSquad(url, bar)
        })
      })
    })
  }).catch(err => {
    console.log('Error getting documents', err)
  })
}

async function writeSquad (url, bar) {
  let response = await fetch(url)
  let data = await response.json()

  adminService.db.collection('squads').doc(data.team_id).set({
    name: data.name,
    country: data.country,
    founded: data.founded,
    leagues: data.leagues,
    venue_name: data.venue_name,
    venue_id: data.venue_id,
    venue_surface: data.venue_surface,
    venue_address: data.venue_address,
    venue_city: data.venue_city,
    venue_capacity: data.venue_capacity,
    coach_name: data.coach_name,
    coach_id: data.coach_id,
    squad: data.squad
  })

  squadCount += 1
  bar.tick()
  if (squadCount === teamCount) {
    buildPlayers()
  }
}

function buildPlayers () {
  console.log('building players')
  var squadsRef = adminService.db.collection('squads')
  squadsRef.get().then(snapshot => {
    snapshot.forEach(doc => {
      // console.log(doc.data())
      for (var i = 0; i < doc.data().squad.length; i++) {
        adminService.db.collection('players').doc(doc.data().squad[i].id).set(doc.data().squad[i])
      }
    })
  }).catch(err => {
    console.log('Error getting documents', err)
  })
}
