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
  },

  buildPlayer: function (obj) {
    let player = {
      id: parseInt(obj.id),
      name: obj.name,
      age: parseInt(obj.age),
      position: obj.position,
      team: parseInt(obj.team_id),
      teamName: obj.team,
      league: obj.league,
      number: parseInt(obj.number),
      injured: obj.injured,
      appearences: parseInt(obj.appearences),
      goals: parseInt(obj.goals),
      assists: parseInt(obj.assists),
      yellowcards: parseInt(obj.yellowcards),
      redcards: parseInt(obj.redcards)
    }
    return player
  },

  buildMatch: function (obj) {
    let match = {
      id: parseInt(obj.id),
      comp_id: parseInt(obj.id),
      formatted_date: obj.formatted_date,
      season: obj.season,
      week: parseInt(obj.week),
      venue: obj.venue,
      venue_id: parseInt(obj.venue_id),
      venue_city: obj.venue_city,
      status: obj.status,
      timer: obj.timer,
      time: obj.time,
      localteam_id: parseInt(obj.localteam_id),
      localteam_name: obj.localteam_name,
      localteam_score: parseInt(obj.localteam_score),
      visitorteam_id: parseInt(obj.visitorteam_id),
      visitorteam_name: obj.visitorteam_name,
      visitorteam_score: parseInt(obj.visitorteam_score),
      ht_score: obj.ht_score,
      ft_score: obj.ft_score,
      et_score: obj.et_score,
      penalty_local: obj.penalty_local,
      penalty_visitor: obj.penalty_visitor,
      events: obj.events
    }
    return match
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
  // let date = moment().subtract(1, 'y').format('DD/MM/YYYY')
  let date = moment().format('DD/MM/YYYY')
  return date.replace('/', '.').replace('/', '.')
}

function getFutureDate () {
  // let date = moment().subtract(1, 'y').add(3, 'M').format('DD/MM/YYYY')
  let date = moment().add(1, 'M').format('DD/MM/YYYY')
  return date.replace('/', '.').replace('/', '.')
}
