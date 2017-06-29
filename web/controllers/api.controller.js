'use strict'


// Imports
const requestify = require("requestify")
const xml2js = require("xml2js")



let router = new express.Router();




function proxyRequest(res, url, options) {
    requestify.get(url, options || {}).then(response => {
        res.send(response.getBody())
    })
    .fail(() => {
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
    
    let options = {
        explicitArray: false,
        trim: true,
        ignoreAttrs: true
    }
    
    console.log('a', new Date())
    
    requestify.get('http://feeds.bbci.co.uk/news/rss.xml')
    .then(response => {
        
        console.log('b', new Date())
        
        xml2js.parseString(response.body, options, function(err, data) {
            
            console.log('c', new Date())
            
            res.send(data.rss.channel.item)
        })
    })
    .fail(() => {
        res.status(400).send('Request Failed')
    })
    
    // proxyRequest(res, `http://gdnws.co.uk/api/pos`)
})




module.exports = {
    root: '/api',
    router: router
};
