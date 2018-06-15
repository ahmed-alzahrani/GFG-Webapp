let config = require('../config/config.js')
let rp = require('request-promise')
let store = require('json-fs-store')('./Resources/Competitions')

exports.populateCompetitions = function () {
  createCompetitions()
}

// gets the list of competitions we have access to throug the live data feed
function createCompetitions () {
  let url = config.baseUrl + 'competitions?Authorization=' + config.apiKey
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

// write standing data from each league to /Resources/Standings if the league is in our config.competitionIds
function createStandings (response) {
  let ids = config.competitionIds
  var store = require('json-fs-store')('./Resources/Standings')

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
      })
    }
  }
}
