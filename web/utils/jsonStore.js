'use strict'

const fs = require("fs")
const path = require("path")

function genStorePath(name) {
    return path.join(__dirname, '..', '..', 'store', `${name}.json`);
}

let storeCache = {}

/**
 * A json-backed storage of key:value pairs
 */
class JsonStore {
    
    /**
     * Creates a new JsonStore with a name & values
     * @param  {String} name The name of the store & where its kept
     * @param  {Object} store The values of the store
     */
    constructor(name, store) {
        this.name = name
        this.store = store || {}
        this.inSync = true
    }
    
    /**
     * Loads a store from a file or creates one if it isn't there
     * @param  {String} name The store to load
     * @return {JsonStore} The store
     */
    static named(name) {
        if (storeCache[name]) return storeCache[name]
        try {
            let json = JSON.parse(fs.readFileSync(genStorePath(name), 'utf8'))
            storeCache[name] = new JsonStore(name, json)
        }
        catch (error) {
            storeCache[name] = new JsonStore(name, {})
        }
        return storeCache[name]
    }
    
    
    
    /**
     * Fetches a value from the store
     * @param  {String}   key The key to look under
     * @return {any|null} The value found (if it exists)
     */
    fetch(key) {
        return this.store[key] || null
    }
    
    /**
     * Puts a value into the store
     * @param  {String} key   The key to store the value in
     * @param  {any}    value The value to put in the store
     * @return {JsonStore} The store so you can chain a sync()
     */
    put(key, value) {
        this.store[key] = value
        this.inSync = false
        return this
    }
    
    /**
     * Synchronises the store if it is needed (performed synchronously)
     * @return {Boolean} If the store was saved correctly
     */
    sync() {
        if (this.inSync) return
        let path = genStorePath(this.name)
        try {
            fs.writeFileSync(path, JSON.stringify(this.store, null, 2), 'utf8')
            this.inSync = true
        }
        catch (error) {
            console.log(error)
        }
        return this.inSync
    }
    
    
}


module.exports = JsonStore
