export default async (app, model) => {
    model.http = await app.import('host/http')
    const Center = model.center = await app.import('center')

    const Config = await app.import('config')
    Config.once('onLoadDone', () => Center.loopTryLink(null))
}
