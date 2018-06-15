let fs = require('fs')
let charitiesStore = require('json-fs-store')('./Resources/Charities')

// returns the charities info that has been written to /Resources/Charities
exports.charities = function () {
  var obj = JSON.parse(fs.readFileSync('Resources/Charities/charities.json', 'utf8'))
  return obj.charities
}

exports.populateCharities = function () {
  createCharities()
}

// writes charities data at /Resources/Charities based on the hard-coded config charity data
function createCharities () {
  let charities = JSON.parse(fs.readFileSync('config/charities.json', 'utf8'))
  let obj = {
    id: 'charities',
    charities: charities
  }
  charitiesStore.add(obj, function (err) { if (err) throw err })
}
