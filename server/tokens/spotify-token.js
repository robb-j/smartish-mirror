const { makeOAuth2Token } = require('../token-tools')

//
// Relevant links
// - https://developer.spotify.com/documentation/general/guides/authorization-guide/
//

module.exports = makeOAuth2Token({
  name: 'spotify',
  clientDashboard: 'https://developer.spotify.com/dashboard/applications',
  authorizeEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
  scope: 'user-read-playback-state user-read-playback-state',
  initialClientId: process.env.SPOTIFY_CLIENT_ID,
  initialClientSecret: process.env.SPOTIFY_CLIENT_SECRET
})
