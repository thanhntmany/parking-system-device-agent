import AppConfig from "./config.js"
import AppApi from './api/index.js'

export default class App {
    constructor() {
        this.config = AppConfig(this)
        this.models = {}
    }

    bootstrap() {
        this.server = AppApi(this)
    }

    start() {
        this.bootstrap()
        this.server.start(8001)
    }
}
