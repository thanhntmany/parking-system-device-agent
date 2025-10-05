export class WebSocketClientHandler extends EventTarget {
    constructor(url, msgHandler) {
        super()
        this.tryReconnect = true
        this.url = url
        this.msgHandler = msgHandler
    }

    connect(url) {
        if (url) this.url = url
        console.log('[wsClient] Try connect:', this.url);

        if (this.socket) this.socket.close()
        const socket = this.socket = new WebSocket(this.url)
        socket.addEventListener("open", e => this.dispatchEvent(new CustomEvent("open", { detail: e })))
        socket.addEventListener("message", e => this.dispatchEvent(new CustomEvent("message", { detail: e })))
        socket.addEventListener("close", e => this.dispatchEvent(new CustomEvent("close", { detail: e })))
        socket.addEventListener("error", e => this.dispatchEvent(new CustomEvent("error", { detail: e })))
        return socket
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
