const emptyCreate = () => ({})

exports.Monzo = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['monzo/balance', 'monzo/pots', 'monzo/recent'],
  requiredTokens: ['Monzo']
}

exports.Spotify = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['spotify/current'],
  requiredTokens: ['Spotify']
}

exports.DarkSky = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['darksky/forecast'],
  requiredTokens: ['DarkSky']
}

// exports.Trello = {
//   createFromCLI: emptyCreate,
//   requiredEndpoints: ['trello/list'],
//   requiredTokens: ['Trello']
// }

exports.GitHub = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['github/activity'],
  requiredTokens: ['GitHub']
}

exports.Clock = {
  createFromCLI: emptyCreate,
  requiredEndpoints: [],
  requiredTokens: []
}

exports.Quote = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['quote/random'],
  requiredTokens: []
}

exports.Guardian = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['guardian/latest'],
  requiredTokens: ['Guardian']
}

exports.Covid19 = {
  createFromCLI: emptyCreate,
  requiredEndpoints: ['untappd/feed'],
  requiredTokens: []
}
