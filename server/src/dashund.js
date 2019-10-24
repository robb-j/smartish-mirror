require('dotenv').config()

const { Dashund } = require('dashund')

const widgets = require('./widgets')
const tokens = require('./tokens')
const endpoints = require('./endpoints')

module.exports = new Dashund(widgets, tokens, endpoints, {
  hostname: process.env.HOSTNAME,
  corsHosts: process.env.CORS_HOSTS && process.env.CORS_HOSTS.split(',')
})
