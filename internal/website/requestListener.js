import express from 'express'
import api from './api/index.js'
import staticWeb from './static.js'
import stream from './stream/index.js'


export default async app => {
    const requestListener = express()
    requestListener.disable('x-powered-by')
    requestListener.enable('strict routing')

    requestListener.use("/stream", await stream(app))
    requestListener.use('/api', await api(app))
    requestListener.use(staticWeb(app))

    return requestListener
}
