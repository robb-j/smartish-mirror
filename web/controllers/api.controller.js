'use strict'


// Imports
const icloud = require('icloud')
const currencyMap = require('currency-symbol-map')

let router = express.Router();




function proxyRequest(res, url, options) {
    requestify.get(url, options || {}).then(response => {
        res.send(response.getBody())
    })
    .fail(response => {
        res.status(400).send('Request failed')
    });
}



// Routes ...

router.get('/', (req, res) => {
    res.send({msg: 'Hello, World!'})
})

router.get('/proxy', (req, res) => {
    
    let url = req.query.url
    
    if (!url) {
        res.status(400).send('Please provide a url')
    }
    
    proxyRequest(res, url)
})




router.get('/quote', (req, res) => {
    
    let url = "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en"
    proxyRequest(res, url)
})

router.get('/calendar', (req, res) => {
    
    proxyRequest(res, config.calendar.url)
})

router.get('/weather', (req, res) => {
    
    let query = `appid=${config.weather.apikey}`
    
    if (req.query.location) {
        query += `&id=${req.query.location}`;
    }
    
    if (req.query.lat && req.query.lon) {
        query += `&lat=${req.query.lat}`
        query += `&lon=${req.query.lon}`
    }
    
    proxyRequest(res, `http://api.openweathermap.org/data/2.5/weather?${query}`)
})

router.get('/news', (req, res) => {
    
    proxyRequest(res, `http://gdnws.co.uk/api/pos`)
})

router.get('/monzo', (req, res) => {
    
    let url = `https://api.monzo.com/balance?account_id=${config.monzo.accountId}`;
    
    let options = {
        headers: { Authorization: 'Bearer ' + config.monzo.accessToken }
    }
    requestify.get(url, options)
    .then(response => {
        
        let body = response.getBody();
        let symbol = currencyMap(body.currency)
        
        res.send({
            balance: body.balance / 100,
            currency: currencyMap(body.currency),
            today: body.spend_today / 100
        });
        
        // res.send(response.getBody())
    })
    .fail(response => {
        res.status(400).send('Request failed')
    });
})




module.exports = {
    root: '/api',
    router: router
};
