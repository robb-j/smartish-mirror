
// Imports
const currencyMap = require('currency-symbol-map')
const winston = require("winston")
const requestify = require("requestify")
const Q = require("q")

const JsonStore = require('../utils/jsonStore')



let router = new express.Router();


router.get('/', (req, res) => {
    
    let api = `https://api.monzo.com`
    
    getAuth().then(auth => {
        
        return Q.all([
            auth,
            requestify.get(`${api}/accounts`, options(auth))
        ])
    })
    .then(([auth, response]) => {
        
        let body = response.getBody()
        
        return requestify.get(`${api}/balance?account_id=${body.accounts[0].id}`, options(auth))
    })
    .then(response => {
        
        let body = response.getBody();
        
        res.send({
            balance: body.balance / 100,
            currency: currencyMap(body.currency),
            today: body.spend_today / 100
        });
    })
    .fail(() => {
        res.status(401).send('Auth failed')
    })
})

function options(auth) {
    return { headers: { Authorization: 'Bearer ' + auth.access_token } }
}

function getAuth() {
    
    // Get auth from the local store
    let auth = JsonStore.named('auth').fetch('monzo')
    
    // If no auth is set, fail
    if (!auth || !auth.access_token) return Q.fail()
    
    // Check the auth is valid via a ping
    return requestify.get(`https://api.monzo.com/ping/whoami`, options(auth))
    .then(response => {
        
        // Get the response, resolve if authenticated
        let json = response.getBody();
        if (json.authenticated) return auth
        
        // If not authenticated, fail if we don't have a refresh token
        if (!auth.refresh_token) return Q.fail()
        
        // Log we're getting new auth
        winston.info('Refreshing Monzo auth');
            
        // Try a refresh
        let options = { dataType: 'form-url-encoded' }
        let body = {
            grant_type: "refresh_token",
            client_id: config.monzo.clientId,
            client_secret: config.monzo.clientSecret,
            refresh_token: auth.refresh_token
        }
        return requestify.post(`https://api.monzo.com/oauth2/token`, body, options)
        .then(resp => {
            
            // Log the event
            winston.info('Monzo auth refreshed');
            
            // Upon success, store the new auth
            let store = JsonStore.named("auth");
            let newAuth = resp.getBody()
            store.put("monzo", newAuth);
            store.sync()
            
            // Resolve with the auth
            return newAuth
        })
    })
}


module.exports = {
    root: '/api/monzo',
    router: router
}
