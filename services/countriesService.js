let fs = require('fs')
let fetch = require('node-fetch')
let store = require('json-fs-store')('./Resources/Countries')

exports.populateCountries = function () {
  createCountries()
}

exports.countries = function () {
  var obj = JSON.parse(fs.readFileSync('Resources/Countries/countries.json', 'utf8'))
  return obj.countries
}

async function createCountries () {
  let url = 'https://restcountries.eu/rest/v2/all'
  var countries = []
  let response = await fetch(url)
  let data = await response.json()
  for (var i = 0; i < data.length; i++) {
    let name = data[i].name
    if (name.length <= 40) { // adjust length of countries here
      countries.push(name)
    }
  }
  let obj = {
    id: 'countries',
    countries: countries
  }

  await store.add(obj, function (err) {
    if (err) throw err
    else {
      console.log('Countries have been loaded')
    }
  })
}
