import { mkdirSync } from 'node:fs'
import { cwd } from 'node:process'
import { join } from 'node:path'

const LOCALDIR = 'local'

export class AppLocaldata {
    constructor(app) {
        this.app = app
        this.path = join(this.app?.config?.cwd || cwd(), LOCALDIR)
    }

    init() {
        mkdirSync(this.path, { recursive: true })
    }

}

export default app => new AppLocaldata(app)
