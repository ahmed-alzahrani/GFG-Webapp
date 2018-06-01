var admin = require('firebase-admin')
var serviceAccount = require('../config/goals-for-good-firebase-adminsdk-m8psc-f9e6fb71bb.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

// let auth = admin.auth()
let db = admin.database()

exports.postUser = async function (user) {
  // create the user, generate their token, then return
  let uid = await addUser(user)
  let token = await generateToken(uid)
  return token
}

function addUser (user) {
  let uid = admin.auth().createUser(user).then(function (userRecord) {
    // write the user Object to the realtime DB using the uid, email and an empty sub array
    let ref = db.ref('users')
    let userObj = {
      email: user.email,
      subscriptions: []
    }
    ref.child(userRecord.uid).set(userObj)
    // return the UID
    return userRecord.uid
  }).catch(function (error) {
    console.log('Error creating new user:', error)
  })
  return uid
}

function generateToken (uid) {
  // generate and return the custom auth token to be returned to the IOS client
  let token = admin.auth().createCustomToken(uid).then(function (customToken) {
    return customToken
  }).catch(function (err) {
    console.log('Error creating custom token:', err)
  })
  return token
}
