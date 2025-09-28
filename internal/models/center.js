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

    const selectAndupdateCenter = model.selectAndupdateCenter = async (ctx, center) => {
        const _center = { ...center }, { uuid } = _center
        delete _center.selectedUuid

        const newConf = {
            center: {
                selectedUuid: uuid,
                centers: {
                    [uuid]: _center
                }
            },
        }
        await Config.merge(ctx, newConf).save()

        if (newConf.center.selectedUuid) model.emit('change-selectedUuid', center)

        return true
    }
    Udp.on(OPERATIONS.I_AM_CENTER, (payload, rinfo) => {
        if (!Config.data.center.selectedUuid || !Config.data.center.centers[Config.data.center.selectedUuid]) selectAndupdateCenter(null, {
            uuid: payload.uuid,
            name: payload.name,
            address: rinfo.address,
            http: {
                port: payload.httpPort,
            }
        })
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

    async function checkHttpConnection(url, timeout = 5000) {
        console.log("[center.checkHttpConnection] url", url);
        const controller = new AbortController()
        const { signal } = controller
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal });
            console.log(`[center.checkHttpConnection] Successfully link to ${url}. Status: ${response.status}`);
            clearTimeout(timeoutId)
            return response.ok;
        } catch (error) {
            console.error(`[center.checkHttpConnection] Network or Fetch Error: ${error.message}`);
            clearTimeout(timeoutId)
            return false;
        }
    }


    {
        var count = 0
        var looping = false
        const loopTryLink = model.loopTryLink = async (ctx, isStart, center) => {
            if (isStart && !looping) {
                count = 0
                looping = true
            }
            ++count
            const { selectedUuid } = Config.data.center
            if (selectedUuid) {
                const center = Config.data.center.centers[selectedUuid]
                if (center) {
                    console.warn("[center.loopTryLink] Try no " + count + ": checkHttpConnection " + "http://" + center.address + ":" + center.http.port + "/api/ping");
                    if (await checkHttpConnection("http://" + center.address + ":" + center.http.port + "/api/ping")) {
                        count = 0
                        looping = false
                        console.log("[center.loopTryLink] linked");
                        return
                    }
                }
                else {
                    Config.data.center.selectedUuid = undefined
                    console.warn("[center.loopTryLink] Try no " + count + ": sendFindCenter")
                    sendFindCenter(ctx)
                }
            }
            else {
                console.warn("[center.loopTryLink] Try no " + count + ": sendFindCenter")
                sendFindCenter(ctx)
            }
            if (count % 5 === 0) Config.data.center.selectedUuid = undefined

            setTimeout(loopTryLink, 1000, false, ctx);
        }
    }
}