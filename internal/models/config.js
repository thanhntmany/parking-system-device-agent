import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { deepAssign } from '#internal/helper.js'


const FsOptions = { encoding: 'utf8' }

export default (app, model) => {
    const ConfigJson = app.ConfigJson || 'config.json'

    const data = model.data = Object.create({
        cwd: process.cwd(),
    })

    const merge = model.merge = (ctx, obj) => {
        deepAssign(data, obj)
        return model
    }

    const load = model.load = (ctx, obj) => {
        deepAssign(data, obj)
        return model
    }

    const loadFile = model.loadFile = (ctx, file) => {
        if (!file) file = join(data.cwd, ConfigJson)
        try {
            return load(ctx, JSON.parse(readFileSync(file, FsOptions)))
        } catch (error) {
            if (error.code === 'ENOENT') {
                app.logger.error(`Not found "${ConfigJson}". It will be created automatically when needed.`)
            }
            else console.error(error)
        }
    }

    const saveTofile = model.saveTofile = (ctx, file) => {
        if (!file) file = join(data.cwd, ConfigJson)
        const obj = { ...data }
        delete obj.cwd
        return writeFile(file, JSON.stringify(obj, null, 2), FsOptions)
    }

    const save = model.save = saveTofile
    const init = model.init = saveTofile

    app.once('onBootstrapDone', (ctx) => {
        loadFile(ctx)
        if (!data.uuid) data.uuid = randomUUID()
        model.emit('onLoadDone')
    })

}