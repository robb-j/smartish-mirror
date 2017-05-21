
// Imports
const winston = require("winston")
const requestify = require("requestify")
const JsonStore = require('../utils/jsonStore')
const queryUtil = require('../utils/query')

let router = new express.Router();
let store = JsonStore.named('auth')

let appUrl = `http://localhost:${config.server.port || 3000}`
function callbackUrl(name) { return `${appUrl}/auth/${name}/callback` }


router.get('/monzo/callback', (req, res) => {
    
    // Finish the oauth
    let state = req.query.state
    let code = req.query.code
    
    // Fail if params are missing
    if (state !== config.monzo.state || !code) {
        return res.status(400).send("Something went wrong")
    }
    
    
    // The params for our oauth token request
    let options = { dataType: 'form-url-encoded' }
    let body = {
        grant_type: "authorization_code",
        client_id: config.monzo.clientId,
        client_secret: config.monzo.clientSecret,
        redirect_uri: callbackUrl('monzo'),
        code: code
    }
    
    // Request an oauth token using the code parameter
    requestify.post(`https://api.monzo.com/oauth2/token`, body, options)
    .then(response => {
        
        // Store the token and redirect back to the mirror
        store.put('monzo', response.getBody())
        store.sync()
        res.redirect('/')
    })
    .fail(error => {
        
        // Log an error and redirect back to the mirror
        winston.error('auth/monzo/callback', error);
        res.redirect('/')
    })
})

router.get('/spotify/callback', (req, res) => {
    
    let state = req.query.state
    let code = req.query.code
    
    if (state !== config.spotify.state || !code) {
        return res.status(400).send("Something went wrong")
    }
    
    let authString = `${config.spotify.clientId}:${config.spotify.clientSecret}`
    let authKey = new Buffer(authString).toString('base64')
    
    let options = {
        dataType: 'form-url-encoded',
        headers: {
            Authorization: `Basic ${authKey}`
        }
    }
    let body = {
        code: code,
        redirect_uri: callbackUrl("spotify"),
        grant_type: 'authorization_code'
    }
    
    requestify.post(`https://accounts.spotify.com/api/token`, body, options)
    .then(response => {
        
        store.put('spotify', response.getBody()).sync()
        res.redirect('/')
    })
    .fail(error => {
        winston.error('auth/spotify/callback', error)
        res.redirect('/')
    })
})


router.get('/spotify', (req, res) => {
    
    let query = queryUtil.params({
        response_type: 'code',
        client_id: config.spotify.clientId,
        scope: 'user-read-playback-state',
        redirect_uri: callbackUrl("spotify"),
        state: config.spotify.state
    })
    
    res.redirect(`https://accounts.spotify.com/authorize?${query}`)
})


router.get('/monzo', (req, res) => {
    
    // Generate a query string to make the oauth login url
    let query = queryUtil.params({
        client_id: config.monzo.clientId,
        redirect_uri: callbackUrl('monzo'),
        response_type: "code",
        state: config.monzo.state
    })
    
    // Return a redirection to the login url
    res.redirect(`https://auth.getmondo.co.uk?${query}`)
})



module.exports = {
    root: '/auth',
    router: router
}
