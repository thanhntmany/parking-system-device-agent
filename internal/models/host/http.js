import http from 'http'
import RequestListener from '#internal/website/requestListener.js'


export default async (app, model) => {
    const Config = await app.import('config')
    Config.merge(null, {
        host: {
            http: {
                type: 'IPv4',
                port: 7080,
                host: '0.0.0.0'
            }
        }
    })

    const server = model.server = http.createServer(model.requestListener = await RequestListener(app))
    server.on('listening', (e) => {
        const { address: host, port } = server.address()
        console.log("[http] listening at http://%s:%s", host, port)
    });
    server.on('error', (e) => {
        app.logger.error(e);
    });

    const start = model.start = () => {
        server.listen(
            Config.data.host.http.port,
            Config.data.host.http.host,
        )
    }

    Config.once('onLoadDone', start)

    return model
}
