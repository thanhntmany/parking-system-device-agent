import http from './http/index.js'
import udp from './udp/index.js'
import ws from './ws/index.js'

export class AppIo {
    constructor(app) {
        this.app = app
    }

    bootstrap() {
        this.http = http(this.app)
        this.ws = ws(this.app)
        this.udp = udp(this.app)
    }

    start() {
        this.bootstrap()
        // this.udp.start(8069)
        // this.ws.start(8081)
        this.http.start(8001)
    }
}

export default app => new AppIo(app)
