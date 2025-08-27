const filename = import.meta.filename

export class Gate {
    constructor(app) {
        this.app = app
    }

    list(ctx) {
        return ctx.query`SELECT * FROM gate`
    }
}

export default app => new Gate(app)
