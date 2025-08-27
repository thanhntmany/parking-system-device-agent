#!/usr/bin/env node
import App from 'parking-system-device-agent'
const app = new App()


const args = process.argv.slice(2)
while (args.length) {
    var token = args.shift()

    if (token.startsWith('--')) {
        token = token.slice(2)

        switch (token) {
            case 'working-directory':
                app.config.cwd = args.shift()
                break;

            default:
                break;
        }
    } else if (token.startsWith('-')) {
        token = token.slice(1)

        const sArgs = token.split("")
        while (sArgs.length) {
            var t = sArgs.shift()
            switch (t) {
                case 'w':
                    app.config.cwd = args.shift()
                    break;

                default:
                    break;
            }

        }
    } else switch (token) {
        case 'init':
            await app.init()
            break;

        case 'start':
            await app.start()
            break;

        case 'run':
            const ctx = app.newContext() // #TODO: auth feature
            console.log(await app.run(ctx, ...args))
            break;

        default:
            // #TODO: show usage
            break;
    }
}
