var rimraf = require('rimraf')
var admin = require('firebase-admin')
let config = require('../config/config.js')

// removes all JSON in the Resources directory with rimraf
exports.cleanJSON = function () {
  rimraf('./Resources', function () {})
}

function cleanStats () {
  admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: 'https://goals-for-good.firebaseio.com'
  })

  var ref = admin.firestore().collection('users')
  ref.get().then(snapshot => {
    snapshot.forEach(user => {
      let stats = {
        goals: 0,
        allGoals: [],
        scorers: [],
        charities: [],
        topScorer: '',
        topCharity: ''
      }
      ref.doc(user.id).update({ stats: stats })
    })
  })
}

this.cleanJSON()
// cleanStats()
