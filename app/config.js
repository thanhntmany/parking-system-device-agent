import { cwd } from 'node:process'
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'

const FsOptions = { encoding: 'utf8' }

const BaseConfig = {
    bootstrap() {
        this.cwd = cwd()
    },

    saveTofile() {
        console.log("save to file")
        return writeFile(join(this.cwd, "config.json"), JSON.stringify(this, null, 2), FsOptions)
    }
}

export default app => {
    const obj = Object.create(BaseConfig)
    obj.bootstrap(app)
    return obj
}