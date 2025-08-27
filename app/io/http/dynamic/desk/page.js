import StrArBackend from 'parking-system-device-agent/lib/StrArBackend.js'
import basePage from '../base.html/page.js'

export default basePage.assign({
    title: StrArBackend.fromFile(import.meta.dirname, 'title.html'),
    head: [StrArBackend.fromFile(import.meta.dirname, 'head.html')],
    body: (await import('./body/body.js')).default,
})
