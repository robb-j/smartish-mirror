const { makeOAuth2Token } = require('../token-tools')
const prompts = require('prompts')

//
// Relevant links
// - https://developer.github.com/v3/#authentication
// - https://developer.github.com/apps/building-oauth-apps/
// - https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
//

module.exports = makeOAuth2Token({
  name: 'github',
  clientDashboard: 'https://github.com/settings/developers',
  authorizeEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  scope: 'repo:status',
  initialClientId: process.env.GITHUB_CLIENT_ID,
  initialClientSecret: process.env.GITHUB_CLIENT_SECRET,
  configureToken: async token => {
    let { username } = await prompts({
      type: 'text',
      name: 'username',
      message: 'User name'
    })

    return { ...token, username }
  }
})
