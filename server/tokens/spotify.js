const querystring = require('querystring')

const { runTemporaryServer } = require('dashund')
const prompts = require('prompts')
const { blue, yellow } = require('kleur')
const randomString = require('crypto-random-string')
const axios = require('axios')
const debug = require('debug')('mirror:token:spotify')

module.exports = {
  //
  // https://developer.spotify.com/documentation/general/guides/authorization-guide/
  //
  async createFromCLI(dashund) {
    const callbackURL = 'http://localhost:1234/callback'
    const colorUrl = yellow().underline

    console.log(
      "First you'll need to setup a Spotify client with",
      blue().bold(`"${callbackURL}"`),
      'set as a callback url'
    )
    console.log(
      'Open:',
      colorUrl('https://developer.spotify.com/dashboard/applications')
    )
    console.log()

    const { clientId, clientSecret } = await prompts([
      {
        type: 'password',
        name: 'clientId',
        message: 'What is your client id?',
        initial: process.env.SPOTIFY_CLIENT_ID
      },
      {
        type: 'password',
        name: 'clientSecret',
        message: 'What is your client secret?',
        initial: process.env.SPOTIFY_CLIENT_SECRET
      }
    ])

    if (!clientId || !clientSecret) throw new Error('Cancelled')

    debug(`prompted client_id=${clientId}, client_secret=${clientSecret}`)

    const state = randomString({ length: 16, type: 'url-safe' })

    const scope = 'user-read-playback-state user-read-playback-state'

    const redir =
      'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: callbackURL,
        scope: scope,
        state: state
      })

    console.log('Now open', colorUrl('http://localhost:1234'))

    let code, returnedState, errorMessage

    await runTemporaryServer(1234, (app, close) => {
      app.get('/', (req, res) => {
        res.redirect(redir)
      })

      app.get('/callback', (req, res) => {
        errorMessage = req.query.error
        code = req.query.code
        returnedState = req.query.state
        res.send('Sweet! go back to the terminal')
        close()
      })
    })

    debug(`callback triggered state=${state} code=${code}`)

    if (errorMessage) {
      throw new Error(`Bad response, '${errorMessage}'`)
    }

    if (returnedState !== state) {
      throw new Error('Invalid state returned, try again?')
    }

    try {
      const body = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: callbackURL,
        client_id: clientId,
        client_secret: clientSecret
      })

      let { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        body
      )

      return makeToken(
        data.access_token,
        data.refresh_token,
        data.token_type,
        data.scope,
        data.expires_in,
        clientId,
        clientSecret
      )

      // return processAuth(auth, clientId, clientSecret)
    } catch (error) {
      debug(`#createFromCLI failed, ${error.message}`)
      throw error
    }
  },

  hasExpired(token) {
    return token.expiresAt < Date.now()
  },

  async refreshToken(token) {
    try {
      debug(`#refreshToken started`)

      let body = querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: token.clientId,
        client_secret: token.clientSecret
      })

      debug(`#refreshToken body=${body}`)

      // https://developer.spotify.com/documentation/general/guides/authorization-guide/#example-2
      let { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        body
      )

      debug(`#refreshToken body=${JSON.stringify(data)}`)

      return makeToken(
        data.access_token,
        token.refreshToken,
        data.token_type,
        data.scope,
        data.expires_in,
        token.clientId,
        token.clientSecret
      )
    } catch (error) {
      debug(`#refreshToken failed, ${error.message}`)
      throw error
    }
  }
}

function makeToken(
  accessToken,
  refreshToken,
  tokenType,
  scope,
  expiresIn,
  clientId,
  clientSecret
) {
  const expiresAt = Date.now() + expiresIn * 1000

  return {
    accessToken,
    refreshToken,
    tokenType,
    scope,
    expiresAt,
    clientId,
    clientSecret
  }
}
