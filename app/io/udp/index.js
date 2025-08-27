import dgram from 'node:dgram'


export class AppUdp {
    constructor(app, port = 8067) {
        this.app = app
        this.port = port
    }

    bootstrap() {
        const socket = this.socket = dgram.createSocket('udp4');
        socket.on('listening', function () {
            const address = socket.address();
            console.log('[udp] listening ' + address.address + ":" + address.port);
        });

    }

    start(port = 8067) {
        this.bootstrap()
        this.socket.bind(port);
    }

    sendBroadcast(buff) {
        this.socket.setBroadcast(true);
        this.socket.send(buff, 0, buff.length, 5555, '255.255.255.255');
    }

    sendMsgBroadcast(msg) {
        this.socket.send(Buffer.from(msg))
    }
}

export default app => new AppUdp(app)