import http from 'http'
import RequestListener from './requestListener.js'

export class AppHttp {
    constructor(app) {
        this.app = app
    }

    bootstrap() {
        const requestListener = this.requestListener = RequestListener(this.app);
        const server = this.server = http.createServer(requestListener)
        server.on('listening', (e) => {
            const { address: host, port } = server.address()
            console.log("[http] listening at http://%s:%s", host, port)
        });
        server.on('error', (e) => {
            this.app.logger.error(e);
        });
    }

    start(port = 3080, host = '0.0.0.0') {
        this.bootstrap()
        this.server.listen(port, host)
    }
}

export default app => new AppHttp(app)