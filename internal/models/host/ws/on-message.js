import { UdpMsgBuff } from 'parking-system-common'
const { OPERATIONS } = UdpMsgBuff


export default async app => {
    const Config = await app.import('config')
    const model = {
        async bootstrap() {
            const Host = await app.import('host')
            const Udp = await app.import('host/udp')
            this.Handlers = {
                [OPERATIONS.I_AM_CENTER]: (payload, rinfo) => {
                    app.emit('foundCenter', app.newContext(), {
                        uuid: payload.uuid,
                        http: {
                            port: payload.httpPort
                        }
                    })
                }
            }
        },

        handleMsg(msg, rinfo) {
            console.log(`[udp] ${rinfo.address}:${rinfo.port} =>`)
            console.log(" > msg", msg);
            console.log(" > len", msg.length);
            const data = UdpMsgBuff.payloadFromBuff(msg)
            console.log(" > data", data);

            const handler = model.Handlers[data.opValue]
            if (!handler) {
                console.log("[on-message] Error", data)
                throw new Error(`Operation is not implemented.`)
            }
            return handler(data.payload, rinfo)
        },
    }

    return model
}
