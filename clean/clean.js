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

/*
function deleteCollection (db, collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath)
  var query = collectionRef.orderBy('__name__').limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}
*/

/*
function deleteQueryBatch (db, query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      var batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => {
        return snapshot.size
      })
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve()
        return
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
      })
    })
    .catch(reject)
}
*/

this.cleanJSON()
cleanStats()
