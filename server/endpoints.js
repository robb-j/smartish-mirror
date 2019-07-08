const axios = require('axios')

module.exports = [
  {
    name: 'monzo/balance',
    requiredTokens: ['Monzo'],
    interval: '1m',
    handler: async ctx => {
      let token = ctx.tokens.get('Monzo')
      let headers = { authorization: `Bearer ${token.access_token}` }

      let res = await axios.get('https://api.monzo.com/accounts', { headers })

      return res.data
    }
  }
]
