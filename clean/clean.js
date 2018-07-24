var rimraf = require('rimraf')
var admin = require('firebase-admin')
let config = require('../config/config.js')

// removes all JSON in the Resources directory with rimraf
rimraf('./Resources', function () {
  console.log()
  console.log('successfully removed JSON resources')
  console.log()
})

admin.initializeApp({
  credential: admin.credential.cert(config.serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

let db = admin.firestore()

var ref = db.collection('users')
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
