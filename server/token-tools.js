const querystring = require('querystring')

const { runTemporaryServer } = require('dashund')
const prompts = require('prompts')
const { blue, yellow } = require('kleur')
const randomString = require('crypto-random-string')
const axios = require('axios')

const colorizeURL = yellow().underline

const promptsOpts = {
  onCancel() {
    throw new Error('Cancelled')
  }
}

// https://tools.ietf.org/html/rfc6749#section-4.1
function makeOAuth2Token({
  name: clientName,
  clientDashboard,
  authorizeEndpoint,
  tokenEndpoint,
  scope,
  initialClientId = undefined,
  initialClientSecret = undefined,
  configureToken = token => token
}) {
  const debug = require('debug')(`mirror:token:${clientName}`)

  return {
    async createFromCLI(dashund) {
      const callbackURL = dashund.makeCallbackURL()

      console.log(
        `First you'll need to setup a ${clientName} client with`,
        blue().bold(`"${callbackURL}"`),
        'set as a callback url'
      )
      console.log('Open:', colorizeURL(clientDashboard))
      console.log()

      const { clientId, clientSecret } = await prompts([
        {
          type: 'password',
          name: 'clientId',
          message: 'What is your client id?',
          initial: initialClientId
        },
        {
          type: 'password',
          name: 'clientSecret',
          message: 'What is your client secret?',
          initial: initialClientSecret
        }
      ])

      if (!clientId || !clientSecret) throw new Error('Cancelled')

      debug(`prompted client_id=${clientId}, client_secret=${clientSecret}`)

      const state = randomString({ length: 16, type: 'url-safe' })

      const redir =
        authorizeEndpoint +
        '?' +
        querystring.stringify({
          response_type: 'code',
          client_id: clientId,
          redirect_uri: callbackURL,
          scope: scope,
          state: state
        })

      console.log(
        'Now open',
        colorizeURL(dashund.makeCallbackURL({ path: '/' }))
      )

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

        const headers = {
          accept: 'application/json'
        }

        let { data } = await axios.post(tokenEndpoint, body, { headers })

        let token = makeToken(
          data.access_token,
          data.refresh_token,
          data.token_type,
          data.scope,
          data.expires_in,
          clientId,
          clientSecret
        )

        return await configureToken(token)
      } catch (error) {
        debug(`#createFromCLI failed, ${error.message}`)
        throw error
      }
    },
    hasExpired(token) {
      return typeof token.expiresAt === 'number' && token.expiresAt < Date.now()
    },
    async refreshToken(token) {
      try {
        debug(`#refreshToken started`)

        // TODO: doesn't persist non-oauth values ...

        let body = querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
          client_id: token.clientId,
          client_secret: token.clientSecret
        })

        debug(`#refreshToken body=${body}`)

        let { data } = await axios.post(tokenEndpoint, body)

        debug(`#refreshToken body=${JSON.stringify(data)}`)

        let newToken = makeToken(
          data.access_token,
          data.refresh_token || token.refreshToken,
          data.token_type,
          data.scope,
          data.expires_in,
          token.clientId,
          token.clientSecret
        )

        return { ...token, ...newToken }
      } catch (error) {
        debug(`#refreshToken failed, ${error.message}`)
        throw error
      }
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

module.exports = { colorizeURL, makeOAuth2Token, promptsOpts }
