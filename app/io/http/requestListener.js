import express from 'express'
import stream from './stream/index.js'
import api from './api/index.js'
import dynamic from './dynamic/index.js'
import staticWeb from './static.js'


export default app => {
    const requestListener = express()
    requestListener.disable('x-powered-by');

    requestListener.use("/stream", stream(app))
    requestListener.use("/api", api(app))
    requestListener.use(dynamic(app))
    requestListener.use(staticWeb(app))

    return requestListener
}