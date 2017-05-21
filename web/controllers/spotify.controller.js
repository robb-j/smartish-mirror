
// Imports
const winston = require("winston")
const requestify = require("requestify")
const Q = require("q")

const JsonStore = require('../utils/jsonStore')



let router = new express.Router();
let api = `https://api.spotify.com/v1`


router.get('/', (req, res) => {
    
    let store = JsonStore.named('auth')
    
    return sendPlayer(res, store)
    .fail(() => {
        
        // Try a refresh
        refreshToken(store).then(() => {
            return sendPlayer(res, store)
        })
        .fail(() => {
            res.status(401, 'Auth Failed')
        })
        
    })
})

function options(store) {
    return { headers: { Authorization: 'Bearer ' + store.fetch('spotify').access_token } }
}

function sendPlayer(res, store) {
    
    return requestify.get(`${api}/me/player?market=GB`, options(store))
    .then(response => {
        
        let body = response.getBody()
        
        res.send({
            track: body.item.name,
            duration: body.item.duration_ms,
            progress: body.progress_ms,
            artist: body.item.album.artists[0].name,
            album: body.item.album.name,
            device: body.device.name,
            repeat: body.repeat_state,
            shuffle: body.shuffle_state,
            playing: body.is_playing
        })
    })
}

function refreshToken(store) {
    
    let authString = `${config.spotify.clientId}:${config.spotify.clientSecret}`
    let authKey = new Buffer(authString).toString('base64')
    
    let options = {
        dataType: 'form-url-encoded',
        headers: { Authorization: `Basic ${authKey}` }
    }
    let body = {
        refresh_token: store.fetch('spotify').refresh_token,
        grant_type: 'refresh_token'
    }
    
    winston.info('Refreshsed spotify auth')
    
    return requestify.post(`https://accounts.spotify.com/api/token`, body, options)
    .then(response => {
        
        winston.info('Spotify auth refreshsed')
        
        let json = response.getBody()
        json.refresh_token = body.refresh_token
        
        store.put('spotify', json).sync()
    })
}


module.exports = {
    root: '/api/spotify',
    router: router
}
