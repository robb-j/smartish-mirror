'use strict'


let router = express.Router();

router.use('/', express.static('public'));

module.exports = {
    root: '/',
    router: router
};
