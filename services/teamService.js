var config = require('../config/config.js')
// var rp = require('request-promise')
let ids = config.competitionIds
let compStore = require('json-fs-store')('./Resources/Competitions')
let standingStore = require('json-fs-store')('./Resources/Standings')
let teamStore = require('json-fs-store')('./Resources/Teams')
let fetch = require('node-fetch')

// Team population function
exports.populateTeams = function () {
  createTeams()
}

// Change this thing
function createTeams () {
  logBeginning()
  // we need to get all the competitions we built
  compStore.load('competitions', function (err, object) {
    if (err) throw err
    // loop through all of the competitions
    let comps = object.competitions
    // make sure its a competition we want to work with
    for (var i = 0; i < comps.length; i++) {
      let competition = comps[i]
      if (ids.indexOf(competition.id) > -1) {
        standingStore.load(competition.name, async function (err, object) {
          if (err) throw err

          let standings = object.standings
          let leagueName = object.id
          // loop through each team per competition
          for (var i = 0; i < standings.length; i++) {
            let team = standings[i]
            // send the req-response to get the detailed team information
            let url = config.baseUrl + 'team/' + team.team_id + '?Authorization=' + config.apiKey

            let response = await fetch(url)
            let data = await response.json()

            let obj = {
              id: team.team_name,
              team_id: team.team_id,
              league: leagueName,
              squad: data.squad
            }

            await teamStore.add(obj, function (err) {
              if (err) throw err
            })
            /*
            rp({
              'method': 'GET',
              'uri': url,
              'json': true
            }).then(function (response) {
              // add a JSON file in the Team directory with the squad of that time so we have our players
              let squad = response.squad
              let obj = {
                id: team.team_name,
                team_id: team.team_id,
                league: leagueName,
                squad: squad
              }
              */
          }
        })
      }
    }
  })
}

function logBeginning () {
  console.log()
  console.log()
  console.log('attmempting to populate the Teams...')
  console.log()
  console.log()
}
