const { join } = require('path')
const fs = require('fs')

const { createServer } = require('http')
const express = require('express')
const cors = require('cors')
const { EndpointResult } = require('dashund')

const dashund = require('../dashund')

;(async () => {
  try {
    const baseURL = join(__dirname, '../../')

    const rawData = await fs.promises.readFile(
      join(baseURL, '.dashund/data-cache.json'),
      'utf8'
    )

    const json = JSON.parse(rawData)

    for (let endpoint in json) {
      const { data, status } = json[endpoint]
      dashund.endpointData.set(endpoint, new EndpointResult(data, status))
    }

    const config = dashund.loadConfig(baseURL)

    dashund.runPreflightChecks(config)

    const app = express()
    const server = createServer(app)

    if (dashund.options.corsHosts.length > 0) {
      app.use(cors({ origin: dashund.options.corsHosts }))
    }

    app.use(dashund.createAPIMiddleware(config))

    dashund.attachSocketServer(config, server)

    // Simulate sockets every ... so often
    setInterval(() => {
      for (let [endpointName, result] of dashund.endpointData) {
        let subs = dashund.subscriptions.get(endpointName) || []
        for (let sub of subs) {
          sub.send(JSON.stringify(result.serialize(endpointName)))
        }
      }
    }, 5000)

    await new Promise(resolve => server.listen(3000, resolve))
    console.log('Listening on :3000')
  } catch (error) {
    console.log('Run offline failed')
    console.log(error)
  }
})()
