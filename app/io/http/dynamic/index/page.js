import StrArBackend from 'parking-system-device-agent/lib/StrArBackend.js'
import basePage from '../base.html/page.js'

export default basePage.clone().assign({
    title: "Parking system",
    head: StrArBackend.fromFile(import.meta.dirname, 'head.html'),
    body: StrArBackend.fromFile(import.meta.dirname, 'body.html'),
})
