var adminService = require('../services/adminService.js')
var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

// let uuidv1 = require('uuid/v1')
let jwt = require('jsonwebtoken')
let bcrypt = require('bcryptjs')
let config = require('../config/config.js')
let VerifyToken = require('./VerifyToken.js')

router.post('/register', function (req, res) {
  adminService.db.collection('users').doc(req.body.email).get().then(doc => {
    if (!doc.exists) {
      // user does not exist we can make them
      var hashedPassword = bcrypt.hashSync(req.body.password, 8)
      let obj = {
        first: '',
        last: '',
        email: req.body.email,
        birthday: '',
        country: '',
        password: hashedPassword,
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

      let response = adminService.db.collection('users').doc(req.body.email).set(obj).then(function () {
        var token = jwt.sign({ id: req.body.email }, config.secret, { expiresIn: 86400 })
        res.status(200).send({ auth: true, token: token })
      }).catch(function (err) {
        console.log('error writing user: ', err)
        res.status(500).send(err)
      })
      return response
    } else {
      // the user DOES exist we must error
      res.status(500).send('a user already exists with this email')
    }
  })
})

router.get('/me', VerifyToken, function (req, res) {
  // res.status(200).send(decoded)
  adminService.db.collection('users').doc(req.userId).get().then(doc => {
    if (!doc.exists) {
      // the user does not exists
      return res.status(404).send('No user found')
    } else {
      var usr = doc.data()
      delete usr.password
      return res.status(200).send(usr)
    }
  })
})

router.post('/login', function (req, res) {
  adminService.db.collection('users').doc(req.body.email).get().then(doc => {
    if (!doc.exists) {
      // the user does not exists
      return res.status(404).send('No user found')
    } else {
      // user exists
      let usrPass = doc.data().password
      var passwordIsValid = bcrypt.compareSync(req.body.password, usrPass)

      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null })

      var token = jwt.sign({ id: req.body.email }, config.secret, { expiresIn: 86400 })

      res.status(200).send({ auth: true, token: token })
    }
  })
})

module.exports = router
