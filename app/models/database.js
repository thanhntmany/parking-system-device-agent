const filename = import.meta.filename

export class Database {
    constructor(app) {
        this.app = app
    }

    get databases() {
        const { app } = this
        const config = app.config || (app.config = {})
        return config.database || (config.database = {})
    }

    get listDb() {
        return this.databases.list || (this.databases.list = {})
    }


    save() {
        return this.app.config.save()
    }

    async new(ctx, id) {
        const { listDb } = this

        if (id === undefined) {
            id = Object.keys(listDb).length + 1
            while (id in listDb) ++id
        }
        id = String(id)
        listDb[id] = {}

        await this.save()
        return id
    }

    async insert(ctx, id, data) {
        const { listDb } = this

        if (id === undefined) {
            id = Object.keys(listDb).length + 1
            while (id in listDb) ++id
        }
        id = String(id)
        listDb[id] = data

        await this.save()
        return id
    }

    async list(ctx) {
        return Object.keys(this.listDb)
    }

    async get(ctx, id) {
        id = String(id)
        return this.listDb[id]
    }

    async getValue(ctx, id, key) {
        id = String(id)
        return this.listDb[id][key]
    }

    async setValue(ctx, id, key, value) {
        id = String(id)
        this.listDb[id][key] = value
        await this.save()
        return this.listDb[id]
    }

    async remove(ctx, id) {
        id = String(id)
        delete this.listDb[id]

        await this.save()
        return Object.keys(this.listDb).length
    }

    async select(ctx, id) {
        id = String(id)
        this.databases.selected = id

        await this.save()
        return id
    }

}

export default app => new Database(app)