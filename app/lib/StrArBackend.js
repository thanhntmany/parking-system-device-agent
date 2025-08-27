import MemcacheFileStorage from './MemcacheFileStorage.js'
import StrAr from 'parking-system-device-agent/io/http/static/lib/StrAr.js'


class StrArBackend extends StrAr {
    static fromFile() {
        return new this(MemcacheFileStorage.apply(null, arguments))
    }

    render(ctx) {
        const arr = this.map(ctx) // load requirements

        return arr.flat(Infinity).join('')
    }
}

export default StrArBackend