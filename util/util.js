let moment = require('moment')
let config = require('../config/config.js')

module.exports = {
  // some competition names are generic across countries, ie: multiple nations have a 'premier league', this function prevents duplicate naming
  adjustCompName: function (competition) {
    if (competition.name === 'Premier League' || competition.name === 'Super League' || competition.name === 'Bundesliga') {
      competition.name = competition.name + ' (' + competition.region + ')'
    }
  },

  // takes in a team id and returns the url at which you can get all of that team's matches for the following month
  getMatchesUrl: function (teamId) {
    let dates = getDates()
    return config.baseUrl + 'matches/?team_id=' + teamId + '&from_date=' + dates[0] + '&to_date=' + dates[1] + '&Authorization=' + config.apiKey
  },

  // compares matches numerically by their ids, used to sort matches retrieved from the server
  compareMatches: function (a, b) {
    if (a.id < b.id) {
      return -1
    } if (a.id > b.id) {
      return 1
    }
    return 0
  }
}

// returns the date in dd.mm.yyyy format of today, and one month from today using helper functions defined below
function getDates () {
  let dates = []
  dates.push(getCurrentDate())
  dates.push(getFutureDate())
  return dates
}

function getCurrentDate () {
  let date = moment().subtract(1, 'y').format('DD/MM/YYYY')
  return date.replace('/', '.').replace('/', '.')
}

function getFutureDate () {
  let date = moment().subtract(1, 'y').add(3, 'M').format('DD/MM/YYYY')
  return date.replace('/', '.').replace('/', '.')
}
