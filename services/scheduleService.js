/*
    Author/s:
    Description: This is the file that is going to include the functions that will be scheduled to be called by the server
*/

// let playerService = require('./services/playerService.js')
// let competitionService = require('./services/competitionService.js')
// let teamService = require('./services/teamService.js')
// let charitiesService = require('./services/charitiesService.js')

// Directories
let playerDirectory = './Resources/Update/Players'
let competitionDirectory = './Resources/Update/Competitions'
let teamServiceDirectory = './Resources/Update/Teams'

// Would be interesting to see how we will update the data after we check the values

// Store pointers to the functions of the js file
module.exports =
{
  checkLiveMatches: CheckLiveMatches,
  checkTeams: CheckTeamDatabase
}

// Check for live matches should occur every 5 mins
function CheckLiveMatches () {
  // Gotta see how the api calls are made
  console.log('checking live matches')


}

// Check for updating teams occurs once a day
function CheckTeamDatabase () {
  // Gotta make the api calls
  console.log('checking team database')
}
