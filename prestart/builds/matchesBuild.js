let store = require('json-fs-store')('./Resources/Matches')

let obj = {
  id: 'matches',
  matches: []
}

store.add(obj, function (err) {
  if (err) throw err
  else {
    console.log('successfully instantiated live matches in resources')
  }
})
