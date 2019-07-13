require('dotenv').config()

const { Dashund } = require('dashund')

const widgets = require('./widgets')
const tokens = require('./tokens')
const endpoints = require('./endpoints')

module.exports = new Dashund(widgets, tokens, endpoints, {
  corsHosts: ['http://localhost:8080']
})
