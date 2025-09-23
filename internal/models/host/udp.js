import dgram from 'dgram'
import { UdpMsgBuff } from 'parking-system-common'
const { payloadFromBuff } = UdpMsgBuff

const udpBase = {
    send(buff, port, address, callback) {
        console.log(`[udp] ${address}:${port} <=`, buff)
        return this.socket.send(buff, 0, buff.length, port, address, callback);
    },

    sendMsg(msg, port, address, callback) {
        return this.send(Buffer.from(msg), port, address, callback)
    },

    sendPayload(opValue, payload, port, host, callback) {
        return this.send(UdpMsgBuff.buffFromPayload(opValue, payload), port, host, callback)
    },
}

export default async (app, model) => {
    const handleMsg = (msg, rinfo) => {
        console.log(`[udp] ${rinfo.address}:${rinfo.port} =>`)
        console.log(`   > msg:`, msg)

        const data = payloadFromBuff(msg)
        console.log(`   >data:`, data)
        model.emit(data.opValue, data.payload, rinfo)
    }

    const broadcast = Object.create(udpBase)
    {
        const socket = broadcast.socket = dgram.createSocket('udp4')
        socket.on('listening', function () {
            socket.setBroadcast(true)
            const address = socket.address()
            app.logger.log('[udp/brd] listening ' + address.address + ":" + address.port)
        })
        socket.on('error', e => {
            app.logger.error('[udp/brd-error]', e);
        })
        socket.on('message', handleMsg);
    }

    const unicast = Object.create(udpBase)
    {
        const socket = unicast.socket = dgram.createSocket('udp4')
        socket.on('listening', function () {
            const address = socket.address()
            app.logger.log('[udp/uni] listening ' + address.address + ":" + address.port)
        })
        socket.on('error', e => {
            app.logger.error('[udp/uni-error]', e);
        })
        socket.on('message', handleMsg);
    }

    Object.assign(model, {
        broadcast,
        unicast,
    })
}
