export class WebSocketClientHandler {
    constructor(url, msgHandler) {
        this.tryReconnect = true
        this.url = url
        this.msgHandler = msgHandler
    }

    connect(url) {
        if (url) this.url = url
        console.log('[wsClient] Connect:', this.url);

        if (this.socket) this.socket.close()

        const socket = this.socket = new WebSocket(this.url)
        socket.addEventListener("open", () => {
            console.log('[wsClient] Connected to WebSocket server:',);
            // Send a message to the server upon connection
            socket.send('Hello from deviceagent!');
        })

        socket.onmessage = (event) => {
            console.log('Message from server:', event.data);
        };
        socket.addEventListener("message", (event) => {
            console.log('Message from server:', event.data);
            this.msgHandler(event)
        })

        socket.addEventListener("close", event => {
            console.log('[wsClient] Disconnected from WebSocket server');
            // this.triggerTryReconnect()
        })

        socket.addEventListener("error", event => {
            console.error('[wsClient] WebSocket error:', event);
            // this.triggerTryReconnect()
        })

        return socket
    }

    forceConnect(url) {
        this.closeSocket()
        this.connect(url)
    }

    closeSocket() {
        if (this.socket) this.socket.close()
    }

    _triggerTryReconnect() {
        console.error('[wsClient] Trigger Try Reconnect:');
    }

    triggerTryReconnect() {
        if (this.triggerTryReconnectInterval) return

        this.triggerTryReconnectInterval = setInterval(
            () => {
                const { socket } = this
                if (socket) {
                    if (socket.readyState === WebSocket.OPEN) {
                        clearInterval(this.triggerTryReconnectInterval)
                        return
                    }
                    else {
                        this.closeSocket()
                        this.connect()
                    }
                } else {
                    this.connect()
                    return
                }

                if (!this.tryReconnect) {
                    clearInterval(this.triggerTryReconnectInterval)
                    return
                }

            },
            3000
        )

        const { socket } = this
        if (this.tryReconnect) {
            if (socket) {
                if (socket.readyState === WebSocket.OPEN) return
            } else {
                this.closeSocket()
            }
            this.connect()
        }
    }

    send(msg) {
        if (socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    }
}


export default async (app, model) => {
    Object.assign(model, {
        new(url, msgHandler) {
            return new WebSocketClientHandler(url, msgHandler)
        },
    })
}
