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
  let response = db.collection('users').doc(user.uid).set(obj).then(function () {
    return generateResponse('User document successfully written!')
  }).catch(function (error) {
    return generateResponse('Error writing user document: ' + error)
  })
  return response
}

function subscriptionCheck (request) {
  var subscriptionRef = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId)
  let response = subscriptionRef.get().then(function (doc) {
    if (doc.exists) {
      return generateResponse(true)
    } else {
      return generateResponse(false)
    }
  })
  return response
}

function addSubscription (request) {
  let timestamp = new Date()
  let timeString = timestamp.toString()

  let obj = {
    name: request.name,
    charity: request.charity,
    time: timeString
  }

  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).set(obj).then(function () {
    return generateResponse('Subscription successfully added!')
  }).catch(function (error) {
    return generateResponse('Error adding new subscription: ' + error)
  })
  return response
}

function removeSubscription (request) {
  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).delete().then(function () {
    return generateResponse('Subscription successfully removed!')
  }).catch(function (error) {
    return generateResponse('Error removing document: ' + error)
  })
  return response
}

function generateResponse (result) {
  let response = {
    result: result
  }
  console.log(response)
  return response
}
