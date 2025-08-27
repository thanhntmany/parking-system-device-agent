import logger from './logger.js'
import config from './data/config.js'
import local from './data/local.js'
import io from './io/index.js'
import models_loader from './models_loader.js'
import context from './context.js'

export default class App {
    constructor() {
        this.config = config(this)
        this.config.loadFile()

        this.logger = logger(this)
        this.localdata = local(this)
        this.models = {}
    }

    async init() {
        this.config.init()
        this.localdata.init()
    }

    async bootstrap() {
        this.models = await models_loader(this)
        this.io = io(this)
    }

    newContext() {
        return context(this)
    }

    async start() {
        await this.bootstrap()
        this.io.start()
    }

    async run(ctx = this.newContext(), modelId, action, ...args) {
        await this.bootstrap()

        const model = this.models[modelId]
        if (!model) throw new Error(`Model '${modelId}' not found`)

        const prop = model[action]
        if (prop instanceof Function) return await model[action](ctx, ...args)
        return prop
    }
}
