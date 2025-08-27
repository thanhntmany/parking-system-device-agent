import { cwd } from 'node:process'
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

const CWD = cwd()
const FsOptions = { encoding: 'utf8' }
const ConfigJson = 'config.json'

const DefaultConf = {
    port: 3000
}

const BaseConfig = {
    bootstrap() {
        if (!Object.hasOwn(this, 'cwd')) this.cwd = CWD
        Object.assign(this, DefaultConf)
    },

    loadFile(file) {
        if (!file) file = join(this.cwd, ConfigJson)
        try {
            Object.assign(this, JSON.parse(readFileSync(file, FsOptions)))
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(error)
            }
        }
        if (!Object.hasOwn(this, 'cwd')) this.cwd = CWD
    },

    saveTofile() {
        const targetPath = join(this.cwd, "config.json")
        const obj = { ...this }
        delete obj.cwd
        return writeFile(targetPath, JSON.stringify(obj, null, 2), FsOptions)
    },

    save() {
        return this.saveTofile()
    },

    init() {
        this.saveTofile()
    }
}

export default app => {
    const obj = Object.create(BaseConfig)
    obj.bootstrap(app)
    return obj
}