var rimraf = require('rimraf')

//removes all JSON in the Resources directory
rimraf('./Resources', function() {
  console.log()
  console.log('successfully removed JSON resources')
  console.log()
})
