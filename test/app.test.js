/*
global describe:true
*/
var charitiesService = require('../services/charitiesService.js')
// const clean = require('../clean/clean.js')
const fs = require('fs')
var assert = require('assert')

describe('makes the call to populate charities and see if it does that', function () {
  it('should populate resources with an object that is identical to config/charities.json', function () {
    charitiesService.populateCharities().then(function () {
      let obj = JSON.parse(fs.readFileSync('config/charities.json', 'utf8'))
      let charities = charitiesService.charities()
      assert.deepEqual(charities, obj)
    })
  })
})
