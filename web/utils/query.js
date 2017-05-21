'use strict'


module.exports = {
    params (object) {
        return _.chain(object)
            .mapValues(encodeURIComponent)
            .map((v, k) => { return `${k}=${v}`})
            .join('&')
            .value()
    }
}
