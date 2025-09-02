import dgram from 'node:dgram'


export class AppUdp {
    constructor(app, port) {
        this.app = app
        this.port = port
    }

    bootstrap() {
        const socket = this.socket = dgram.createSocket('udp4')
        const _this = this

        socket.on('listening', function () {
            const address = socket.address()
            console.log('[udp] listening ' + address.address + ":" + address.port)
        })

        socket.on('error', e => {
            this.app.logger.error('[udp-error]', e)
        })

        socket.on('message', function (message, remote) {
            console.log(`[udp] ${remote.address}:${remote.port} ->:`, String(message))

            if (remote.port == 9070) {
                _this.send("Hellow Server!", remote.port, remote.address)
            }
            if (remote.port == 9069) {
                _this.send("Hellow UNI!", remote.port, remote.address)
            }
        })
    }

    start() {
        this.socket.bind(this.port)
    }

    sendBuff(buff, port, host, callback) {
        this.socket.send(buff, 0, buff.length, port, host, callback);
    }

    send(msg, port, host, callback) {
        console.log(`[udp] ${host}:${port}   <-:`, msg)
        this.sendBuff(Buffer.from(msg), port, host, callback)
    }
}

export default (app, port = 8069) => new AppUdp(app, port)