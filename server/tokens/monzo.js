const querystring = require('querystring')

const { runTemporaryServer } = require('dashund')
const prompts = require('prompts')
const { blue, yellow } = require('kleur')
const randomString = require('crypto-random-string')
const axios = require('axios')
const debug = require('debug')('mirror:token:monzo')

module.exports = {
  //
  // https://docs.monzo.com/#acquire-an-access-token
  //
  async createFromCLI(dashund) {
    const callbackURL = dashund.makeCallbackURL()
    const colorUrl = yellow().underline

    console.log(
      "First you'll need to setup a Monzo client with",
      blue().bold(`"${callbackURL}"`),
      'set as a callback url'
    )
    console.log('Open:', colorUrl('https://developers.monzo.com/apps'))
    console.log()

    let { clientId, clientSecret } = await prompts([
      {
        type: 'password',
        name: 'clientId',
        message: 'What is your client id?',
        initial: process.env.MONZO_CLIENT_ID
      },
      {
        type: 'password',
        name: 'clientSecret',
        message: 'What is your client secret?',
        initial: process.env.MONZO_CLIENT_SECRET
      }
    ])

    if (!clientId || !clientSecret) throw new Error('Cancelled')

    debug(`prompted client_id=${clientId}, client_secret=${clientSecret}`)

    let state = randomString({ length: 16, type: 'url-safe' })

    let redir =
      'https://auth.monzo.com?' +
      querystring.stringify({
        client_id: clientId,
        redirect_uri: callbackURL,
        response_type: 'code',
        state: state
      })

    console.log('Now open', colorUrl('http://localhost:1234'))

    let code, returnedState

    await runTemporaryServer(1234, (app, close) => {
      app.get('/', (req, res) => {
        res.redirect(redir)
      })
      app.get('/callback', (req, res) => {
        code = req.query.code
        returnedState = req.query.state
        res.send('Sweet! go back to the terminal')
        close()
      })
    })

    debug(`callback triggered state=${state} code=${code}`)

    if (returnedState !== state) {
      throw new Error('Invalid state returned, try again?')
    }

    try {
      let body = querystring.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackURL,
        code: code
      })

      let { data: auth } = await axios.post(
        'https://api.monzo.com/oauth2/token',
        body
      )

      await prompts({
        type: 'invisible',
        name: 'confirmedWait',
        message: 'Confirmed in the app too? (press enter)'
      })

      // Use our new auth to get the user's accounts
      let { data } = await axios.get('https://api.monzo.com/accounts', {
        headers: { authorization: `Bearer ${auth.access_token}` }
      })

      // Pick the user's first active account
      let accountId = data.accounts.filter(acc => !acc.closed)[0].id

      return processAuth(auth, clientId, clientSecret, accountId)
    } catch (error) {
      debug(`#createFromCLI failed, ${error.message}`)
      throw error
    }
  },

  //
  // If the token has expired
  //
  hasExpired(token) {
    return typeof token.expires_at === 'number' && token.expires_at < Date.now()
  },

  //
  // https://docs.monzo.com/#acquire-an-access-token
  //
  async refreshToken(token) {
    try {
      debug(`#refreshToken started`)

      let body = querystring.stringify({
        grant_type: 'refresh_token',
        client_id: token.client_id,
        client_secret: token.client_secret,
        refresh_token: token.refresh_token
      })

      debug(`#refreshToken body=${body}`)

      let { data: auth } = await axios.post(
        'https://api.monzo.com/oauth2/token',
        body
      )

      debug(`#refreshToken body=${JSON.stringify(auth)}`)

      return processAuth(
        auth,
        token.client_id,
        token.client_secret,
        token.account_id
      )
    } catch (error) {
      debug(`#refreshToken failed, ${error.message}`)
      throw error
    }
  }
}

// { access_token, refresh_token, client_id, expires_in, token_type, user_id }
// plus { client_id, client_secret, expires_at }
function processAuth(auth, clientId, clientSecret, accountId) {
  return {
    ...auth,
    client_id: clientId,
    client_secret: clientSecret,
    account_id: accountId,
    expires_at: Date.now() + auth.expires_in * 1000
  }
}
