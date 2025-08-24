import AppApi from './api/index.js'

class App {
    constructor() {
        console.log("Create app")
    }

    bootstrap() {
        this.server = AppApi(this)
    }

    start() {
        this.bootstrap()
        this.server.start(8001)
    }
}

export default App
