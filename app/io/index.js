import http from './http/index.js'
import udp from './udp/index.js'
import ws from './ws/index.js'

export class AppIo {
    constructor(app) {
        this.app = app
        this.ws = ws(this.app)
        this.http = http(this.app)
        this.udp = udp(this.app, 8069)
    }

    bootstrap() {
        this.udp.bootstrap()
    }

    start() {
        this.bootstrap()

        this.udp.start()
        // this.ws.start(8081)
        this.http.start(8080)
    }
}

export default app => new AppIo(app)
