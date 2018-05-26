let config = require('../config/config.js')
let rp = require('request-promise')
let store = require('json-fs-store')('./Resources/Competitions')

exports.populateCompetitions = function () {
  createCompetitions()
}

// getCompetitions queries the service for the list of competitions we have access to
// it then passes the competitions off to getStandings()
function createCompetitions () {
  let url = config.baseUrl + 'competitions?Authorization=' + config.apiKey
  // request-promise to execute the writing of JSON after the promise of querying for competitions
  rp({
    'method': 'GET',
    'uri': url,
    'json': true
  }).then(function (response) {
    // id of the object we write also becomes the JSON file name
    let obj = {
      id: 'competitions',
      competitions: response
    }
    store.add(obj, function (err) {
      if (err) throw err
    })
    createStandings(response)
  })
}

// takes in the list of competitions we have access to
// uses this to query the service
function createStandings (response) {
  let ids = config.competitionIds
  var store = require('json-fs-store')('./Resources/Standings')

  // loop through the competitions and ensure they exist in the configs pre-defined list
  // this filters out cup competitions both domestic and european, to avoid duplicating players
  for (var i = 0; i < response.length; i++) {
    let competition = response[i]
    if (ids.indexOf(competition.id) > -1) {
    //  util.adjustCompName(competition)
      let url = config.baseUrl + 'standings/' + competition.id + '?Authorization=' + config.apiKey
      rp({
        'method': 'GET',
        'uri': url,
        'json': true
      }).then(function (response) {
        let obj = {
          id: competition.name,
          standings: response
        }

        store.add(obj, function (err) {
          if (err) throw err
        })
        // we've populated the Standings directory with the standings of this given competition
        console.log('finished populating the standings for.... ' + competition.name)
      })
    }
  }
}
