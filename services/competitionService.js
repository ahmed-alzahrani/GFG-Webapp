let config = require('../config/config.js')
let store = require('json-fs-store')('./Resources/Competitions')
let fetch = require('node-fetch')

exports.populateCompetitions = function () {
  createCompetitions()
}

// getCompetitions queries the service for the list of competitions we have access to
// it then passes the competitions off to getStandings()
async function createCompetitions () {
  let url = config.baseUrl + 'competitions?Authorization=' + config.apiKey
  // request-promise to execute the writing of JSON after the promise of querying for competitions
  let response = await fetch(url)
  let data = await response.json()

  let obj = {
    id: 'competitions',
    competitions: data
  }

  await store.add(obj, function (err) {
    if (err) throw err
    else {
      console.log('Competitions have been loaded')
      createStandings(data) // After all the data is there create the standings
    }
  })
}

// takes in the list of competitions we have access to
// uses this to query the service
async function createStandings (response) {
  let ids = config.competitionIds
  var store = require('json-fs-store')('./Resources/Standings')

  for (var i = 0; i < response.length; i++) {
    let competition = response[i]
    if (ids.indexOf(competition.id) > -1) {
      // util.adjustCompName(competition)
      let url = config.baseUrl + 'standings/' + competition.id + '?Authorization=' + config.apiKey
      let res = await fetch(url)
      let data = await res.json()

      let obj = {
        id: competition.name,
        standings: data
      }

      await store.add(obj, function (err) {
        if (err) throw err
        else {
          console.log('Standings have been loaded')
        }
      })
    }
  }
}
