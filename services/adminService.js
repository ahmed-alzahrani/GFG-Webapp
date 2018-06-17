var admin = require('firebase-admin')
let serviceAccount = require('../config/serviceAccount.json')
let config = require('../config/config.js')
let fetch = require('node-fetch')
let util = require('../util/util.js')


// initialize Firebase admin SDK

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

exports.getTeamIds = async function (id) {
  let ids = await teamIds(id)
  return ids
}

// returns list of unique matches that will be played by the teams whose ids are in ids
exports.getMatches = async function (ids) {
  var matches = []
  var matchIds = []
  for (var i = 0; i < ids.length; i++) {
    let url = util.getMatchesUrl(ids[i])
    let response = await fetch(url)
    let data = await response.json()
    for (var x = 0; x < data.length; x++) {
      if (matchIds.includes(data[x].id)) {
        continue
      } else {
        matchIds.push(data[x].id)
        matches.push(data[x])
      }
    }
  }
  return matches.sort(util.compareMatches)
}

// writes a new user object into the Firebase Firestore NoSQL database based on the auth user created
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

// returns to the client whether the user is subscribed already to a particular player
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

// adds a users' subscription based on the info provided in the request body
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

// removes a users' subscription based on the player id in the request body
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

// takes in a user id and returns a list of team ids that belong that users' subscriptions
function teamIds (id) {
  var ids = []
  let response = db.collection('users').doc(id).collection('subscriptions').get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      ids.push(doc.data().team)
    })
    return ids
  }).catch(function (error) {
    console.log(error)
    return []
  })
  return response
}

// serializes response generation for routes that return a true/false response flag
function generateResponse (result, message) {
  let response = {
    result: result,
    message: message
  }
  console.log(response)
  return response
}
