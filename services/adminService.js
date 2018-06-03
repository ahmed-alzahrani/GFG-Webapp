var admin = require('firebase-admin')
var serviceAccount = require('../config/goals-for-good-firebase-adminsdk-m8psc-f9e6fb71bb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

let db = admin.firestore()

exports.addUser = async function (user) {
  let response = await writeUser(user)
  return response
}

exports.amISubscribed = async function (request) {
  let response = await subscriptionCheck(request)
  return response
}

exports.subscribe = async function (request) {
  let response = await addSubscription(request)
  return response
}

exports.unsubscribe = async function (request) {
  let response = await removeSubscription(request)
  return response
}

function writeUser (user) {
  let obj = {
    name: '',
    email: user.email
  }
  db.collection('users').doc(user.uid).set(obj).then(function () {
    let response = 'User document successfully written!'
    console.log(response)
    return response
  }).catch(function (error) {
    let response = 'Error writing user document: ' + error
    console.log(response)
    return response
  })
}

function subscriptionCheck (request) {
  var subscriptionRef = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId)
  subscriptionRef.get().then(function (doc) {
    if (doc.exists) {
      console.log('Document data: ', doc.data())
      return true
    } else {
      console.log('No such document!')
      return false
    }
  })
}

function addSubscription (request) {
  let timestamp = new Date()
  let timeString = timestamp.toString()

  let obj = {
    name: request.name,
    charity: request.charity,
    time: timeString
  }

  db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).set(obj).then(function () {
    let response = 'Subscription successfully added!'
    console.log(response)
    return response
  }).catch(function (error) {
    let response = 'Error adding new subscription: ' + error
    console.log(response)
    return response
  })
}

function removeSubscription (request) {
  db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).delete().then(function () {
    let response = 'Subscription successfully removed!'
    console.log(response)
    return response
  }).catch(function (error) {
    let response = 'Error removing document: ' + error
    console.log(response)
    return response
  })
}
