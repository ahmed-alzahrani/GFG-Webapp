let nodemailer = require('nodemailer')
let config = require('../config/config.js')

module.exports = {
  sendGoalEmail: sendGoalEmail
}

function sendGoalEmail (recipient, charity, scorer) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: config.email,
      pass: config.password
    },
    tls: {
      rejectUnathorized: false
    }
  })

  let subjectLine = 'Thanks to you and ' + scorer + ' ONE dollar has been raised for ' + charity + '!'

  let helperOptions = {
    from: 'Goals For Good' < 'goals4goodgoalnotifications@gmail.com',
    to: recipient,
    subject: subjectLine,
    text: 'Format text for e-mail here.'
  }

  transporter.sendMail(helperOptions, (error, info) => {
    if (error) console.log(error)
    console.log('confirmation e-mail sent:')
    console.log(info)
    console.log()
  })
}
