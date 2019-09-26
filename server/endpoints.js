const axios = require('axios')

module.exports = [
  {
    name: 'monzo/balance',
    requiredTokens: ['Monzo'],
    interval: '1m',
    handler: async ctx => {
      let token = ctx.tokens.get('Monzo')
      let headers = { authorization: `Bearer ${token.access_token}` }
      let params = { account_id: token.account_id }

      let res = await axios.get('https://api.monzo.com/balance', {
        params,
        headers
      })

      return res.data
    }
  },
  {
    name: 'monzo/pots',
    requiredTokens: ['Monzo'],
    interval: '10m',
    handler: async ctx => {
      let token = ctx.tokens.get('Monzo')
      let headers = { authorization: `Bearer ${token.access_token}` }

      let res = await axios.get('https://api.monzo.com/pots', { headers })

      return res.data
    }
  },
  {
    name: 'monzo/recent',
    requiredTokens: ['Monzo'],
    interval: '5m',
    handler: async ctx => {
      let since = new Date()
      since.setDate(since.getDate() - 5)

      let token = ctx.tokens.get('Monzo')
      let headers = { authorization: `Bearer ${token.access_token}` }
      let params = {
        account_id: token.account_id,
        limit: 50,
        since: since
      }

      let res = await axios.get('https://api.monzo.com/transactions', {
        params,
        headers
      })

      return res.data
    }
  },
  {
    name: 'spotify/current',
    requiredTokens: ['Spotify'],
    interval: '5s',
    handler: async ctx => {
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
    }
  }
]
