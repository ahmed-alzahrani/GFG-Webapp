var admin = require('firebase-admin')
var serviceAccount = require('../config/goals-for-good-firebase-adminsdk-m8psc-f9e6fb71bb.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

// let auth = admin.auth()
let db = admin.database()

exports.postUser = async function (user) {
  // add user will handle the creation of a new user, as well as addition of that user to the userDB
  addUser(user)
}

function addUser (user) {
  admin.auth().createUser({
    email: user.email,
    emailVerified: false,
    password: user.password,
    disabled: false
    // this can be split into 2 funcs once the async is figured out
  }).then(function (userRecord) {
    let ref = db.ref('users')
    let userObj = {
      email: user.email,
      subscriptions: []
    }
    ref.child(userRecord.uid).set(userObj)
    admin.auth().createCustomToken(userRecord.uid).then(function (customToken) {
      console.log(customToken)
    }).catch(function (err) {
      console.log('Error creating custom token:', err)
    })
  }).catch(function (error) {
    console.log('Error creating new user:', error)
  })
}
