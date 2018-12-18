import fs from 'fs'
import path from 'path'

export default class Store {
    constructor(dir, ns) {
        if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
            console.error(this.constructor.name + ' instantiated with invalid directory: ' + dir)
            process.exit(1)
        }

        this.ns = ns
        this.dir = path.resolve(dir)
        this.prefix = path.join(dir, ns + '-')
    }

    toString() {
        return `${this.constructor.name} at ${this.dir}, namespace '${this.ns}'`
    }

    getPath(key) {
        return this.prefix + key
    }

    getJSON(key) {
        return JSON.parse(this.get(key))
    }

    setJSON(key, value) {
        this.set(key, JSON.stringify(value))
    }

    get(key) {
        try {
            return fs.readFileSync(this.getPath(key), { encoding: 'utf8' })
        } catch (e) {
            return null
        }
    }

    set(key, value) {
        fs.writeFileSync(this.getPath(key), value)
    }
}
