var admin = require('firebase-admin')
let config = require('../config/config.js')
var serviceAccount = require(config.serviceAccount)
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

exports.getSubscriptions = async function (id) {
  let response = await subscriptions(id)
  return response
}

exports.getMatches = async function (id) {
  let response = await matches(id)
  return response
}

function writeUser (user) {
  let obj = {
    name: '',
    email: user.email
  }
  let response = db.collection('users').doc(user.uid).set(obj).then(function () {
    return generateResponse(true, 'User document successfully written!')
  }).catch(function (error) {
    return generateResponse(false, 'Error writing user document: ' + error)
  })
  return response
}

function subscriptionCheck (request) {
  var subscriptionRef = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId)
  let response = subscriptionRef.get().then(function (doc) {
    if (doc.exists) {
      return generateResponse(true, 'Subscription exists')
    } else {
      return generateResponse(false, 'Subscription does not exist')
    }
  })
  return response
}

function addSubscription (request) {
  let timestamp = new Date()
  let timeString = timestamp.toString()

  let obj = {
    name: request.name,
    team: request.team,
    teamName: request.teamName,
    charity: request.charityName,
    charityId: request.charityId,
    time: timeString
  }

  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).set(obj).then(function () {
    return generateResponse(true, 'Subscription successfully added!')
  }).catch(function (error) {
    return generateResponse(false, 'Error adding new subscription: ' + error)
  })
  return response
}

function removeSubscription (request) {
  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).delete().then(function () {
    return generateResponse(true, 'Subscription successfully removed!')
  }).catch(function (error) {
    return generateResponse(false, 'Error removing document: ' + error)
  })
  return response
}

function subscriptions (id) {
  let response = db.collection('users').doc(id).collection('subscriptions').get().then(function (querySnapshot) {
    let collection = []
    querySnapshot.forEach(function (doc) {
      let data = doc.data()
      let obj = {
        id: doc.id,
        charity: data.charity,
        charityId: data.charityId,
        name: data.name,
        team: data.team,
        teamName: data.teamName,
        time: data.time
      }
      collection.push(obj)
    })
    return collection
  }).catch(function (error) {
    console.log(error)
    return []
  })
  return response
}

function matches (id) {
  return {}
}

function generateResponse (result, message) {
  let response = {
    result: result,
    message: message
  }
  console.log(response)
  return response
}
