'use strict'

global.express = require('express')
global._ = require('lodash')
global.requestify = require('requestify')
global.config = require('./config')


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
app.listen(3000)
