const r = /({{\S+?}})/g,
    m = function (v) {return v instanceof StrAr ? v.map(this) : Array.isArray(v) ? v.map(m, this) : v}

class pH {
    constructor(key) {
        this.key = key
    }
}

export default class StrAr {
    constructor(i) {
        if (i instanceof this.constructor) {
            this._ = i._
            this.obj = Object.create(i.obj)
        } else this.loadRaw(i)
    }

    loadRaw(raw) {
        this._ = String(raw).split(r).map(function (v) {
            if (v.match(r)) {
                const key = v.slice(2, -2).trim()
                this[key] = []
                return new pH(key)
            }
            return v
        }, this.obj = Object.create(null))
    }

    clone() {
        return new this.constructor(this)
    }

    get(key) {
        return this.obj[key]
    }

    assign(obj) {
        Object.assign(this.obj, obj)
        return this
    }

    map(ctx) {
        return this._.map(v => {
            if (v instanceof pH) v = this.obj[v.key] || ''
            return v instanceof StrAr ? v.map(ctx) : Array.isArray(v) ? v.map(m, ctx) : v
        }, ctx)
    }

    render(ctx) {
        return this.map(ctx).flat(Infinity).join('')
    }
}
