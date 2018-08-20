let config = require('../config/config.js')
let fetch = require('node-fetch')
let fs = require('fs')

let charitiesStore = require('json-fs-store')('./Resources/Charities')
let countriesStore = require('json-fs-store')('./Resources/Countries')
let matchesStore = require('json-fs-store')('./Resources/Matches')
let competitionStore = require('json-fs-store')('./Resources/Competitions')
let standingsStore = require('json-fs-store')('./Resources/Standings')
let teamStore = require('json-fs-store')('./Resources/Teams')
let playerStore = require('json-fs-store')('./Resources/Players')

let ids = config.competitionIds
var teamCount = 0

function createCharities () {
  let charities = JSON.parse(fs.readFileSync('config/charities.json', 'utf8'))
  let obj = {
    id: 'charities',
    charities: charities
  }

  charitiesStore.add(obj, function (err) {
    if (err) throw err
    buildMatches()
  })
}

function buildMatches () {
  let obj = {
    id: 'matches',
    matches: []
  }

  matchesStore.add(obj, function (err) {
    if (err) throw err
    buildCountries()
  })
}

async function buildCountries () {
  let url = 'https://restcountries.eu/rest/v2/all'
  var countries = []
  let response = await fetch(url)
  let data = await response.json()
  for (var i = 0; i < data.length; i++) {
    let name = data[i].name
    if (name.length <= 40) { // adjust length of countries here
      countries.push(name)
    }
  }
  let obj = {
    id: 'countries',
    countries: countries
  }

  await countriesStore.add(obj, function (err) {
    if (err) throw err
    buildCompetitions()
  })
}

async function buildCompetitions () {
  let url = config.baseUrl + 'competitions?Authorization=' + config.apiKey
  let response = await fetch(url)
  let data = await response.json()

  let obj = {
    id: 'competitions',
    competitions: data
  }

  competitionStore.add(obj, function (err) {
    if (err) throw err
    buildStandings(data)
  })
}

async function buildStandings (data) {
  var count = 0
  for (var i = 0; i < data.length; i++) {
    let competition = data[i]
    if (ids.indexOf(competition.id) > -1) {
      // util.adjustCompName(competition)
      let url = config.baseUrl + 'standings/' + competition.id + '?Authorization=' + config.apiKey
      let res = await fetch(url)
      let json = await res.json()

      let obj = {
        id: competition.name,
        standings: json
      }
      teamCount += obj.standings.length
      standingsStore.add(obj, function (err) {
        if (err) throw err
        count += 1
        if (count === ids.length) {
          buildTeams()
        }
      })
    }
  }
}

async function buildTeams () {
  competitionStore.load('competitions', function (err, object) {
    if (err) throw err
    let comps = object.competitions
    for (var i = 0; i < comps.length; i++) {
      let competition = comps[i]
      if (ids.indexOf(competition.id) > -1) {
        standingsStore.load(competition.name, async function (err, object) {
          if (err) throw err
          let standings = object.standings
          let leagueName = object.id
          // loop through each team in the competition
          var count = 0
          for (var i = 0; i < standings.length; i++) {
            let team = standings[i]
            let url = config.baseUrl + 'team/' + team.team_id + '?Authorization=' + config.apiKey

            let response = await fetch(url)
            let data = await response.json()

            let obj = {
              id: team.team_name,
              team_id: team.team_id,
              league: leagueName,
              squad: data.squad
            }
            // write the info about that team we receive to /Resources/Teams
            teamStore.add(obj, function (err) {
              if (err) throw err
              count += 1
              console.log(count)
              if (count === teamCount) {
                buildPlayers()
              }
            })
          }
        })
      }
    }
  })
}

function buildPlayers () {
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
        if (player.number === '') {
          player.number = '0'
        }

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

createCharities()
