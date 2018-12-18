export default class Creatable {
    constructor(o) {
        Object.keys(o).forEach(k => this[k] = o[k])
    }

    static create(...args) {
        return new this(...args)
    }
}
