const prompts = require('prompts')
const { colorizeURL, promptsOpts } = require('../token-tools')

//
// Relevant links
// - https://darksky.net/dev/account
//

module.exports = {
  async createFromCLI(dashund) {
    console.log("First, you'll need a darksky client")
    console.log('Open:', colorizeURL('https://darksky.net/dev/account'))
    console.log()

    const { secretKey, lat, lng } = await prompts(
      [
        {
          type: 'password',
          name: 'secretKey',
          message: 'Enter your darksky secret key',
          initial: process.env.DARKSKY_SECRET_KEY
        },
        {
          type: 'text',
          name: 'lat',
          message: 'Forcast latitude'
        },
        {
          type: 'text',
          name: 'lng',
          message: 'Forcast longitude'
        }
      ],
      promptsOpts
    )

    return { secretKey, lat, lng }
  },
  hasExpired() {
    return false
  },
  refreshToken() {
    return null
  }
}
