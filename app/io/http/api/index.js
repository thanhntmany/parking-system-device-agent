import express from 'express'

import host from './host.js'
import gate from './gate.js'
import database from './database.js'


export default app => {
    const router = express.Router()

    router.use("/host", host(app))
    router.use("/gate", gate(app))
    router.use("/database", database(app))

    return router
}