const axios = require('axios')

const bearerHeader = token => ({ authorization: `Bearer ${token}` })

const wrapAxiosError = block => {
  return async (...args) => {
    try {
      return await block(...args)
    } catch (error) {
      if (error.isAxiosError && error.response) {
        const { status, statusText, data } = error.response
        const { method, url, params, headers } = error.config

        const newError = new Error(`AxiosError: ${status} - ${statusText}`)
        newError.data = data
        newError.config = { method, url, params, headers }

        throw newError
      }
      throw error
    }
  }
}

module.exports = [
  {
    name: 'monzo/balance',
    requiredTokens: ['Monzo'],
    interval: '1m',
    handler: wrapAxiosError(async ctx => {
      let token = ctx.tokens.get('Monzo')
      let headers = bearerHeader(token.accessToken)
      let params = { account_id: token.accountId }

      let res = await axios.get('https://api.monzo.com/balance', {
        params,
        headers
      })

      return res.data
    })
  },
  {
    name: 'monzo/pots',
    requiredTokens: ['Monzo'],
    interval: '10m',
    handler: wrapAxiosError(async ctx => {
      let token = ctx.tokens.get('Monzo')
      let headers = bearerHeader(token.accessToken)

      let res = await axios.get('https://api.monzo.com/pots', { headers })

      return res.data
    })
  },
  {
    name: 'monzo/recent',
    requiredTokens: ['Monzo'],
    interval: '5m',
    handler: wrapAxiosError(async ctx => {
      let since = new Date()
      since.setDate(since.getDate() - 5)

      let token = ctx.tokens.get('Monzo')
      let headers = bearerHeader(token.accessToken)
      let params = {
        account_id: token.accountId,
        limit: 50,
        since: since
      }

      let res = await axios.get('https://api.monzo.com/transactions', {
        params,
        headers
      })

      return res.data
    })
  },
  {
    name: 'spotify/current',
    requiredTokens: ['Spotify'],
    interval: '5s',
    handler: wrapAxiosError(async ctx => {
      let token = ctx.tokens.get('Spotify')

      let headers = { authorization: `Bearer ${token.accessToken}` }
      let params = {}

      let res = await axios.get(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          params,
          headers
        }
      )

      return res.data
    })
  },
  {
    name: 'github/activity',
    requiredTokens: ['GitHub'],
    interval: '5m',
    handler: wrapAxiosError(async ctx => {
      let { username, accessToken } = ctx.tokens.get('GitHub')
      let headers = bearerHeader(accessToken)

      let res = await axios.get(
        `https://api.github.com/users/${username}/events`,
        { headers }
      )

      return res.data
    })
  },
  {
    name: 'quote/random',
    requiredTokens: [],
    interval: '5m',
    handler: wrapAxiosError(async ctx => {
      let res = await axios.get(
        'https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en'
      )

      return res.data
    })
  },
  {
    name: 'darksky/forecast',
    requiredTokens: ['DarkSky'],
    interval: '30m',
    handler: wrapAxiosError(async ctx => {
      let { secretKey, lat, lng } = ctx.tokens.get('DarkSky')

      let params = {
        exclude: 'minutely,daily',
        units: 'si'
      }

      let res = await axios.get(
        `https://api.darksky.net/forecast/${secretKey}/${lat},${lng}`,
        { params }
      )

      return res.data
    })
  },
  {
    name: 'guardian/latest',
    requiredTokens: ['Guardian'],
    interval: '10m',
    handler: wrapAxiosError(async ctx => {
      let { secretKey, sections } = ctx.tokens.get('Guardian')

      let params = {
        'api-key': secretKey,
        section: sections.join('|')
      }

      let res = await axios.get(`https://content.guardianapis.com/search`, {
        params
      })

      return res.data.response.results
    })
  }
]
