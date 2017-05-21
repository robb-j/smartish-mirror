'use strict'


global.express = require('express')
global._ = require('lodash')
global.requestify = require('requestify')
global.config = require('./config')


// Imports
const winston = require("winston")



// Setup the logger
winston.configure({
    transports: [
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'logs/access.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'logs/error.log',
            level: 'error'
        }),
        new (winston.transports.Console)({
            name: 'console',
            level: 'error'
        })
    ]
});



// Create our express app
let app = express()
let controllers = require('./controllers')



// Register our controllers
_.forEach(controllers, (controller) => {
    if (controller.root && controller.router) {
        app.use(controller.root, controller.router)
    }
})



// Start the server on 3000
let port = config.server.port || 3000
app.listen(port)
console.log('Setup on localhost:'+port);
