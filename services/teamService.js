var config = require('../config/config.js')
var rp = require('request-promise')
let ids = config.competitionIds
let compStore = require('json-fs-store')('./Resources/Competitions')
let standingStore = require('json-fs-store')('./Resources/Standings')
let teamStore = require('json-fs-store')('./Resources/Teams')

exports.populateTeams = function () {
  createTeams()
}

function createTeams () {
  // loop through competitions
  compStore.load('competitions', function (err, object) {
    if (err) throw err
    let comps = object.competitions
    for (var i = 0; i < comps.length; i++) {
      let competition = comps[i]
      if (ids.indexOf(competition.id) > -1) {
        // load standings data for each competition
        standingStore.load(competition.name, function (err, object) {
          let standings = object.standings
          let leagueName = object.id
          // loop through each team in the competition
          for (var i = 0; i < standings.length; i++) {
            let team = standings[i]
            let url = config.baseUrl + 'team/' + team.team_id + '?Authorization=' + config.apiKey
            rp({
              'method': 'GET',
              'uri': url,
              'json': true
            }).then(function (response) {
              let squad = response.squad
              let obj = {
                id: team.team_name,
                team_id: team.team_id,
                league: leagueName,
                squad: squad
              }
              // write the info about that team we receive to /Resources/Teams
              teamStore.add(obj, function (err) {
                if (err) throw err
              })
            })
          }
          if (err) throw err
        })
      }
    }
  })
}
