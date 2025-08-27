import { WebSocketServer } from 'ws'

export class AppWs {
    constructor(app) {
        this.app = app
        this.clientIdCount = 0
        this.clients = Object.create(null)
    }

    start(port = 3000) {
        const wss = this.server = new WebSocketServer({ port });
        this.app.logger.log("[ws] listening on port:", wss.address().port)

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
        });
    }
}

export default app => new AppWs(app)
