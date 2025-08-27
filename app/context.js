export class AppContext {
    constructor(app) {
        this.app = app
    }

    async hasPerm() {
        return true
    }

    async query() {

    }
}

export default async app => new AppContext(app)