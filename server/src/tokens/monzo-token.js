const prompts = require('prompts')
const axios = require('axios')

const { makeOAuth2Token } = require('../token-tools')

//
// Relevant links
// - https://docs.monzo.com/#acquire-an-access-token
//

module.exports = makeOAuth2Token({
  name: 'monzo',
  clientDashboard: 'https://developers.monzo.com/apps',
  authorizeEndpoint: 'https://auth.monzo.com',
  tokenEndpoint: 'https://api.monzo.com/oauth2/token',
  scope: '',
  initialClientId: process.env.MONZO_CLIENT_ID,
  initialClientSecret: process.env.MONZO_CLIENT_SECRET,
  configureToken: async token => {
    await prompts({
      type: 'invisible',
      name: 'confirmedWait',
      message: 'Confirmed in the app too? (press enter)'
    })

    // Use our new auth to get the user's accounts
    let { data } = await axios.get('https://api.monzo.com/accounts', {
      headers: { authorization: `Bearer ${token.accessToken}` }
    })

    // Add the account id
    return {
      ...token,
      accountId: data.accounts.filter(acc => !acc.closed)[0].id
    }
  }
})
