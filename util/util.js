let moment = require('moment')
let config = require('../config/config.js')

module.exports = {
  adjustCompName: function (competition) {
    if (competition.name === 'Premier League' || competition.name === 'Super League' || competition.name === 'Bundesliga') {
      competition.name = competition.name + ' (' + competition.region + ')'
    }
  },

  getMatchesUrl: function (teamId) {
    let dates = getDates()
    return config.baseUrl + 'matches/?team_id=' + teamId + '&from_date=' + dates[0] + '&to_date=' + dates[1] + '&Authorization=' + config.apiKey
  },

  compareMatches: function (a, b) {
    if (a.id < b.id) {
      return -1
    } if (a.id > b.id) {
      return 1
    }
    return 0
  }
}

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
