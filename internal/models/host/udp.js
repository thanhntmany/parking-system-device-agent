import dgram from 'dgram'
import os from 'os'
import { UdpMsgBuff } from 'parking-system-common'
const { payloadFromBuff, OPERATIONS_ARRAY } = UdpMsgBuff

const udpBase = {
    send(buff, port, address, callback) {
        console.log(`[udp] ${address}:${port} <= buff`, buff.length)
        return this.socket.send(buff, 0, buff.length, port, address, callback);
    },

    sendMsg(msg, port, address, callback) {
        return this.send(Buffer.from(msg), port, address, callback)
    },

    sendPayload(opValue, payload, port, host, callback) {
        console.log(`[udp] ${host}:${port} <=`, OPERATIONS_ARRAY[opValue].code, payload)
        return this.send(UdpMsgBuff.buffFromPayload(opValue, payload), port, host, callback)
    },
}

export default async (app, model) => {
    const handleMsg = (msg, rinfo) => {
        const data = payloadFromBuff(msg)
        console.log(`[udp] ${rinfo.address}:${rinfo.port} =>`, OPERATIONS_ARRAY[data.opValue].code, ":", data)
        model.emit(data.opValue, data.payload, rinfo)
    }

    const broadcast = Object.create(udpBase)
    {
        const socket = dgram.createSocket('udp4')
        socket.on('listening', function () {
            socket.setBroadcast(true)
            const address = socket.address()
            app.logger.log('[udp/brd] listening ' + address.address + ":" + address.port)
        })
        socket.on('error', e => {
            app.logger.error('[udp/brd-error]', e);
        })
        socket.on('message', handleMsg);
        socket.bind(() => {
            socket.setBroadcast(true);
        })

        Object.assign(broadcast, {
            socket,
            send(buff, port, address, callback) {
                const interfaces = os.networkInterfaces();
                let broadcastAddresses = [];

                for (const interfaceName in interfaces) {
                    for (const iface of interfaces[interfaceName]) {
                        if (iface.family === 'IPv4') {
                            const ipParts = iface.address.split('.').map(Number);
                            const netmaskParts = iface.netmask.split('.').map(Number);
                            const broadcastParts = ipParts.map((ip, i) => ip | (~netmaskParts[i] & 255));
                            broadcastAddresses.push(broadcastParts.join('.'));
                        }
                    }
                }

                for (const address of broadcastAddresses) {
                    socket.send(buff, 0, buff.length, port, address, (err) => {
                        if (err) {
                            console.error(`[udp/brd] Error => ${address}:`, err);
                        } else {
                            console.log(`[udp/brd] => ${address}:${port}`);
                        }
                    })
                }
            },
            sendPayload(opValue, payload, port, host, callback) {
                console.log(`[udp/brd] :${port} <=`, OPERATIONS_ARRAY[opValue].code, ":", payload)
                return this.send(UdpMsgBuff.buffFromPayload(opValue, payload), port, host, callback)
            },
        })

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
