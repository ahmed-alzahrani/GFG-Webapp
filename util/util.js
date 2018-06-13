module.exports = {
  adjustCompName: function (competition) {
    if (competition.name === 'Premier League' || competition.name === 'Super League' || competition.name === 'Bundesliga') {
      competition.name = competition.name + ' (' + competition.region + ')'
    }
  }
}
