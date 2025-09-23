import { EventEmitter } from 'node:events'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'


const appContextBase = {
    name: "app-context",

    async hasPerm() {
        return true
    },

    async query() {

    }
}


const dir = import.meta.dirname
export default class App extends EventEmitter {
    constructor() {
        super()
        this.ConfigJson = 'DeviceAgentConfig.json'
        this.logger = console
        this._models = {}
    }

    import(modelPath, modelKey) {
        const { _models } = this
        if (modelKey === undefined) modelKey = modelPath
        if (Object.hasOwn(_models, modelKey)) return _models[modelKey]

        return import(pathToFileURL(join(dir, 'models', modelPath + '.js'))).then(async module => {
            const model = _models[modelKey] = module.newModel ? await module.newModel(this) : new EventEmitter()
            if (model.bootstrap) await model.bootstrap()
            if (module.default) await module.default(this, model)
            return model
        })
    }

    async init() {
        const config = await this.import('config')
        this.emit('onBootstrapDone')
        config.saveTofile()
    }

    async start() {
        await this.import('host')
        this.emit('onBootstrapDone')
    }

    newContext() {
        return Object.create(appContextBase)
    }

    async call(ctx = this.newContext(), modelId, action, ...args) {
        const model = await this.import(modelId)
        this.emit('onBootstrapDone')

        const prop = model[action]
        if (prop instanceof Function) return await model[action](ctx, ...args)
        return prop
    }

    async run(...args) {
        try {
            return { result: await this.call(...args) }
        } catch (error) {
            return {
                error: {
                    message: error.message,
                    code: error.code
                }
            }
        }
    }

}
