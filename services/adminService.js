var admin = require('firebase-admin')
var serviceAccount = require('../config/goals-for-good-firebase-adminsdk-m8psc-f9e6fb71bb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

// let auth = admin.auth()
let db = admin.firestore()

exports.addUser = async function (user) {
  let response = await writeUser(user)
  return response
}

function writeUser (user) {
  let obj = {
    name: '',
    email: user.email
  }
  db.collection('users').document(user.uid).setData(obj).then(function () {
    let response = 'User document successfully written!'
    console.log(response)
    return response
  }).catch(function (error) {
    let response = 'Error writing user document: ' + error
    console.log(response)
    return response
  })
}
