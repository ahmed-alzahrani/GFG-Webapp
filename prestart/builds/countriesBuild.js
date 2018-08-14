let countriesService = require('../../services/countriesService.js')
// simply triggers the countriesService
console.log('about to try populate countries')
console.log(typeof countriesService.populateCountries)
countriesService.populateCountries()
