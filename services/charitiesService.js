let fs = require('fs')
let charitiesStore = require('json-fs-store')('./Resources/Charities')

exports.populateCharities = function () {
  createCharities()
}

exports.getCharities = function () {
  var obj = JSON.parse(fs.readFileSync('Resources/Charities/charities.json', 'utf8'))
  return obj.charities
}

function createCharities () {
  let charities = JSON.parse(fs.readFileSync('config/charities.json', 'utf8'))
  let obj = {
    id: 'charities',
    charities: charities
  }
  charitiesStore.add(obj, function (err) { if (err) throw err })
}
