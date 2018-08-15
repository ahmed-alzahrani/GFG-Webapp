var admin = require('firebase-admin')
let fetch = require('node-fetch')
let config = require('../config/config.js')
let util = require('../util/util.js')
let mailService = require('../services/mailService.js')

// initialize Firebase admin SDK

admin.initializeApp({
  credential: admin.credential.cert(config.serviceAccount),
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

exports.updateSubscription = async function (request) {
  let response = await updateSub(request)
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

exports.getProfile = async function (uid) {
  let response = await profile(uid)
  return response
}

exports.handleGoal = async function (playerId) {
  var ref = db.collection('users')
  ref.get().then(snapshot => {
    snapshot.forEach(user => {
      if (playerId === '') {
        playerId = 'empty'
      }
      var subscriptionRef = db.collection('users').doc(user.id).collection('subscriptions').doc(playerId)
      subscriptionRef.get().then(function (subscription) {
        if (subscription.exists) {
          let newGoals = subscription.data().goals + 1
          subscriptionRef.doc(playerId).update({
            goals: newGoals
          })
          let stats = updateStats(user.data().stats, subscription.data(), playerId)
          ref.doc(user.id).update({ stats: stats })
          mailService.sendGoalEmail(user.data().email, subscription.data().charity, subscription.data().name)
        } else {
        }
      })
    })
  })
    .catch(err => {
      console.log('Error getting all users', err)
    })
}

function updateStats (stats, subscription, playerId) {
  // time stamp of goal being added
  let timestamp = new Date()
  let timeString = timestamp.toString()
  // extract existing stat info to update with
  let charity = subscription.charityId
  var goals = stats.goals + 1
  var allGoals = stats.allGoals
  var charities = stats.charities
  var scorers = stats.scorers

  // add the new goal into the allGoals array
  allGoals.push({
    charityName: subscription.charity,
    charity: charity,
    player: playerId,
    playerName: subscription.name,
    teamName: subscription.teamName,
    team: subscription.team,
    time: timeString
  })

  // update charities / scorers with the new goal information
  var exists = false
  for (var i = 0; i < charities.length; i++) {
    if (charities[i].id === charity) {
      charities[i].count += 1
      exists = true
      break
    }
  }
  if (!exists) {
    charities.push({
      id: charity,
      name: subscription.charity,
      count: 1
    })
  }

  exists = false
  for (i = 0; i < scorers.length; i++) {
    if (scorers[i].id === playerId) {
      scorers[i].count += 1
      exists = true
      break
    }
  }

  if (!exists) {
    scorers.push({
      id: playerId,
      name: subscription.name,
      count: 1
    })
  }
  charities.sort(findTop)
  scorers.sort(findTop)

  // return the obj
  return {
    goals: goals,
    allGoals: allGoals,
    charities: charities,
    scorers: scorers,
    topScorer: scorers[0].name,
    topCharity: charities[0].name
  }
}
// writes a new user object into the Firebase Firestore NoSQL database based on the auth user created
function writeUser (user) {
  let obj = {
    first: '',
    last: '',
    email: user.email,
    birthday: '',
    country: '',
    stats:
      {
        goals: 0,
        allGoals: [],
        scorers: [],
        charities: [],
        topScorer: '',
        topCharity: ''
      }
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
    goals: 0,
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

function updateSub (request) {
  let obj = {
    charity: request.charityName,
    charityId: request.charityId
  }
  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).update(obj).then(function () {
    return generateResponse(true, 'Subscription successfully ')
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

function profile (uid) {
  var userRef = db.collection('users').doc(uid)
  let response = userRef.get().then(function (doc) {
    if (doc.exists) {
      let obj = {
        birthday: doc.data().birthday,
        country: doc.data().country,
        email: doc.data().email,
        first: doc.data().first,
        last: doc.data().last,
        stats: doc.data().stats
      }
      return obj
    } else {
      return generateResponse(false, 'User does not exist')
    }
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

function findTop (a, b) {
  if (a.count === b.count) {
    return a.name.localeCompare(b.name)
  } else {
    return a.count - b.count
  }
}
