var admin = require('firebase-admin')
let fetch = require('node-fetch')
let config = require('../config/config.js')
let util = require('../util/util.js')

// initialize Firebase admin SDK

admin.initializeApp({
  credential: admin.credential.cert(config.serviceAccount),
  databaseURL: 'https://goals-for-good.firebaseio.com'
})

let db = admin.firestore()
const settings = {timestampsInSnapshots: true}
db.settings(settings)

// PUBLIC API

exports.db = db

exports.addUser = AddUser

exports.getProfile = GetProfile
exports.deleteProfile = DeleteProfile
exports.updateProfile = UpdateProfile

exports.subscriptions = Subscriptions
exports.amISubscribed = AmISubscribed
exports.subscribe = Subscribe
exports.unsubscribe = Unsubscribe
exports.updateSubscription = UpdateSubscription

exports.getTeamIds = GetTeamIds
exports.getMatches = GetMatches
exports.participants = Participants

// PRIVATE IMPLEMENTATION

// writes a new user object into the Firebase Firestore NoSQL database based on the auth user created
function AddUser (user) {
  if (user.email == null || user.uid == null) {
    return 404
  }
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
    return 200
  }).catch(function (err) {
    console.log('error writing user: ', err)
    return 404
  })
  return response
}

function GetProfile (uid) {
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
      return { code: 404 }
    }
  })
  return response
}

function DeleteProfile (uid) {
  if (uid == null) {
    return 404
  }
  let response = db.collection('users').doc(uid).delete().then(function () {
    return 200
  }).catch(function (err) {
    console.log('error trying to delete the user: ', err)
    return 404
  })
  return response
}

function UpdateProfile (request, uid) {
  if (request.country == null || request.first == null || request.last == null) {
    return { code: 404 }
  }
  let obj = {
    first: request.first,
    last: request.last,
    country: request.country
  }
  let response = db.collection('users').doc(uid).update(obj).then(function () {
    console.log('success')
    return { code: 200, response: 'successfully updated profile' }
  }).catch(function (err) {
    console.log('Error updating profile: ', err)
    return { code: 404 }
  })
  return response
}

function Subscriptions (id) {
  let response = db.collection('users').doc(id).collection('subscriptions').get().then(function (querySnapshot) {
    let collection = []
    querySnapshot.forEach(function (doc) {
      let data = doc.data()
      let obj = {
        id: parseInt(doc.id),
        charity: data.charity,
        charityId: parseInt(data.charityId),
        name: data.name,
        team: parseInt(data.team),
        teamName: data.teamName,
        goals: parseInt(data.goals),
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

// returns to the client whether the user is subscribed already to a particular player
function AmISubscribed (uid, playerId) {
  if (uid == null || playerId == null) {
    return 404
  }
  var subscriptionRef = db.collection('users').doc(uid).collection('subscriptions').doc(playerId)
  let response = subscriptionRef.get().then(function (doc) {
    if (doc.exists) {
      return true
    } else {
      return false
    }
  })
  return response
}

// adds a users' subscription based on the info provided in the request body
function Subscribe (request) {
  if (request.name == null || request.team == null || request.teamName == null || request.charityName == null || request.charityId == null || request.uid == null || request.playerId == null) {
    return 404
  }
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
    return 200
  }).catch(function (err) {
    console.log('error, invalid request param: ', err)
    return 404
  })
  return response
}

// just so i can find this func
// removes a users' subscription based on the player id in the request body
function Unsubscribe (request) {
  if (request.uid == null || request.playerId == null) {
    return 404
  }
  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).delete().then(function () {
    return 200
  }).catch(function (err) {
    console.log('error trying to delete the subscription: ', err)
    return 404
  })
  return response
}

function UpdateSubscription (request) {
  if (request.uid == null || request.playerId == null || request.charityName == null || request.charityId == null) {
    return 404
  }
  let obj = {
    charity: request.charityName,
    charityId: request.charityId
  }
  let response = db.collection('users').doc(request.uid).collection('subscriptions').doc(request.playerId).update(obj).then(function () {
    return 200
  }).catch(function (err) {
    console.log('error updating subscription: ', err)
    return 404
  })
  return response
}

// takes in a user id and returns a list of team ids that belong that users' subscriptions
function GetTeamIds (id) {
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

async function GetMatches (ids) {
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
        let match = util.buildMatch(data[x])
        matchIds.push(data[x].id)
        matches.push(match)
      }
    }
  }
  return matches.sort(util.compareMatches)
}

function Participants (uid, local, visitor) {
  let response = db.collection('users').doc(uid).collection('subscriptions').get().then(function (querySnapshot) {
    let participants = []
    querySnapshot.forEach(function (doc) {
      let data = doc.data()
      if (data.team === local || data.team === visitor) {
        let string = data.name + ' (' + data.teamName + ')'
        participants.push(string)
      }
    })
    return participants
  }).catch(function (error) {
    console.log(error)
    return []
  })
  return response
}
