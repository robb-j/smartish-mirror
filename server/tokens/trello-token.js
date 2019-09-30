const querystring = require('querystring')
const prompts = require('prompts')
const { colorizeURL, promptsOpts } = require('../token-tools')

//
// Relevant links
// - https://developers.trello.com/page/authorization#section-using-basic-oauth
//

module.exports = {
  async createFromCLI(dashund) {
    console.log("First, you'll need a trello app key")
    console.log('Open:', colorizeURL('https://trello.com/app-key'))
    console.log()

    const { appKey } = await prompts(
      {
        type: 'password',
        name: 'appKey',
        message: 'Enter your trello app key',
        initial: process.env.TRELLO_APP_KEY
      },
      promptsOpts
    )

    const authorizeURL = 'https://trello.com/1/authorize'

    // https://trello.com/1/authorize?expiration=1day&name=MyPersonalToken&scope=read&response_type=token&key={YourAPIKey}

    const params = querystring.stringify({
      expiration: 'never',
      name: 'Smartish Mirror',
      scope: 'read',
      response_type: 'token',
      key: appKey
    })

    console.log('Now visit', colorizeURL(authorizeURL + '?' + params))

    const { accessToken } = await prompts({
      type: 'password',
      name: 'accessToken',
      message: 'Enter your access token'
    })

    return { appKey, accessToken }
  },
  hasExpired() {
    return false
  },
  refreshToken() {
    return null
  }
}
