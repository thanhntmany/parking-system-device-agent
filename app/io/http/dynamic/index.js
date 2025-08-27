import express from 'express'
import desk from './desk/index.js'
import gate from './gate/index.js'
import deviceAgent from './device-agent/index.js'
import dashboard from './dashboard/index.js'
import config from './config/index.js'
import logs from './logs/index.js'
import index from './index/index.js'


export default app => {
    const router = express.Router()
    router.use(/^\/desk\//, desk)
    router.use("/gate", gate)
    router.use("/device-agent", deviceAgent)
    router.use("/dashboard", dashboard)
    router.use("/config", config)
    router.use("/logs", logs)
    router.use("/", index)
    return router
}