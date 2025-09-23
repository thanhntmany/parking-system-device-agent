import { WebSocketServer } from 'ws'


export default async app => {
    const Config = await app.import('config')
    Config.merge({
        host: {
            ws: {
                port: 9081
            }
        }
    })

    const model = {
        clientIdCount: 0,
        clients: Object.create(null),

        async bootstrap() {
            // #TODO: apply onMessage
            // this.onMessage = await app.import('host/ws/on-message')
        },

        start(ctx) {
            const wss = this.server = new WebSocketServer({
                port: Config.host.ws.port
            });
            app.logger.log("[ws] listening on port:", wss.address().port)

            wss.on('error', (e) => {
                this.app.logger.error(e);
            });

            wss.on('connection', (ws, req) => {
                const clientId = ++this.clientIdCount
                this.clients[clientId] = { ws }

                console.log(`[ws@${clientId}] New connect:`, req.url)
                console.log(`[ws] Number of current connects:`, Object.keys(this.clients).length)

                ws.on('message', (data, isBinary) => {
                    console.log(`[ws@${clientId}] Received message: ${data}`)
                    ws.send(`Server received: ${data}`)
                });

                ws.on('close', (code, reason) => {
                    console.log(`[ws@${clientId}] Client disconnected`)
                    delete this.clients[clientId]
                    console.log(`[ws] Number of current connects:`, Object.keys(this.clients).length)
                })

                ws.send(`Welcome to the WebSocket server!`);
            })
        },
    }

    Config.once('onLoadDone', () => {
        model.start()
    })

    return model
}
