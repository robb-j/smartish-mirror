
let router = new express.Router();

router.use('/', express.static('public'));

module.exports = {
    root: '/',
    router: router
};
