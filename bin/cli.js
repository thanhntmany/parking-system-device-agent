#!/usr/bin/env node
import App from '#internal/index.js'
const app = new App()

const args = process.argv.slice(2)
const cliSleepMs = 1000
while (args.length) {
    var token = args.shift()

    if (token.startsWith('--')) {
        token = token.slice(2)

        switch (token) {
            case 'working-directory':
                app.config.cwd = args.shift()
                break;

            case 'sleep':
                cliSleepMs = parseInt(args.shift())
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

                case 's':
                    cliSleepMs = parseInt(args.shift())
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
            let _args = []
            let a
            while (a = args.shift()) {
                if (a === '--json') {
                    try {
                        a = JSON.parse(args.shift())
                    } catch (error) {
                        console.error(error)
                    }
                }
                _args.push(a)
            }

            try {
                console.log(await app.call(app.newContext(), ..._args))
            } catch (error) {
                console.log(error)
            } finally {
                await new Promise(resolve => setTimeout(resolve, cliSleepMs))
                process.exit(0)
            }

    }
}
