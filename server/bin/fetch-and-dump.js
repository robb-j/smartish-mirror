const { join } = require('path')
const fs = require('fs')
const dashund = require('../dashund')
const { performEndpoint, performTokenRefresh } = require('dashund')

;(async () => {
  try {
    const baseURL = join(__dirname, '../../')

    const data = {}
    const config = dashund.loadConfig(baseURL)

    for (let endpoint of dashund.endpoints) {
      data[endpoint.name] = await performEndpoint(
        endpoint,
        config,
        performTokenRefresh
      )
    }

    await fs.promises.writeFile(
      join(baseURL, '.dashund/data-cache.json'),
      JSON.stringify(data)
    )
  } catch (error) {
    console.log('Failed to fetch and dump')
    console.log(error)
  }
})()
