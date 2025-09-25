import { flattenObject } from '#internal/helper.js'
import { UdpMsgBuff } from 'parking-system-common'
const { OPERATIONS } = UdpMsgBuff


export default async (app, model) => {
    const Config = await app.import('config')
    Config.merge(null, {
        center: {
            centers: {}
        },
    })

    const Udp = model.udp = await app.import('host/udp')
    const Host = await app.import('host')

    const list = model.list = ctx => flattenObject(Config.data.centers)
    const get = model.get = (ctx, uuid) => model.list(ctx)[uuid || Config.data.center.selectedUuid]
    const set = model.set = async (ctx, opts) => {
        // validate user right. Check if has systemadmin right (master password)
        Config.load(ctx, { center: opts })
        await Config.save(ctx)
        return true
    }

    const updateCenter = model.updateCenter = async (ctx, center) => {
        const _center = { ...center }, { uuid } = _center
        delete _center.selectedUuid

        const newConf = {
            center: {
                centers: {
                    [uuid]: _center
                }
            },
        }
        if (!Config.data.center.selectedUuid || !Config.data.center.centers[Config.data.center.selectedUuid]) newConf.center.selectedUuid = uuid
        await Config.merge(ctx, newConf).save()

        if (newConf.center.selectedUuid) model.emit('change-selectedUuid', center)

        return true
    }
    const sendIAmDeviceAgent = model.sendIAmDeviceAgent = (ctx, payload, ...args) => {
        return Udp.unicast.sendPayload(
            UdpMsgBuff.OPERATIONS.I_AM_DEVICE_AGENT,
            payload,
            ...args
        )
    }
    Udp.on(OPERATIONS.I_AM_CENTER, (payload, rinfo) => {
        updateCenter(null, {
            uuid: payload.uuid,
            address: rinfo.address,
            http: {
                port: payload.httpPort,
            }
        })
        sendIAmDeviceAgent(
            null,
            {
                uuid: Config.data.uuid,
                name: Config.data.name,
                httpPort: Host.http.server.address().port
            },
            rinfo.port, rinfo.address)
    })

    const sendFindCenter = model.sendFindCenter = async (ctx, uuid = Config.data.center.selectedUuid, port = 9070, address = '0.0.0.0') => {
        Udp.broadcast.sendPayload(
            UdpMsgBuff.OPERATIONS.DISCOVER_CENTER,
            { uuid },
            port, address
        )
        return true
    }
    Config.once('onLoadDone', () => sendFindCenter(null))

    async function checkHttpConnection(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} - ${response.statusText}`)
                return false
            }

            console.log(`Successfully connected to ${url}. Status: ${response.status}`);
            return true;
        } catch (error) {
            console.error(`Network or Fetch Error: ${error.message}`);
            return false;
        }
    }

    {
        var count = 0
        var looping = false
        const loopTryConnect = model.loopTryConnect = async (ctx, isStart, center) => {
            if (isStart && !looping) {
                count = 0
                looping = true
            }
            ++count
            const { selectedUuid } = Config.data.center
            if (selectedUuid) {
                const center = Config.data.center.centers[selectedUuid]
                if (center) {
                    console.warn("[center.loopTryConnect] Try no " + count + ": checkHttpConnection " + "http://" + center.address + ":" + center.http.port + "/api/ping");
                    if (await checkHttpConnection("http://" + center.address + ":" + center.http.port + "/api/ping")) {
                        count = 0
                        looping = false
                        console.log("[center.loopTryConnect] Connected");
                        return
                    }
                }
                else {
                    Config.data.center.selectedUuid = undefined
                    console.warn("[center.loopTryConnect] Try no " + count + ": sendFindCenter")
                    sendFindCenter(ctx)
                }
            }
            else {
                console.warn("[center.loopTryConnect] Try no " + count + ": sendFindCenter")
                sendFindCenter(ctx)
            }
            if (count % 5 === 0) Config.data.center.selectedUuid = undefined

            setTimeout(loopTryConnect, 1000, false, ctx);
        }
    }
}