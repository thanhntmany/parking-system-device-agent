import StrArBackend from 'parking-system-device-agent/lib/StrArBackend.js'

const dirname = import.meta.dirname
export default StrArBackend.fromFile(dirname, 'body.html').assign({
    attr: StrArBackend.fromFile(dirname, 'attr.html'),
    header: StrArBackend.fromFile(dirname, 'header.html'),
    content: StrArBackend.fromFile(dirname, 'content.html'),
    footer: StrArBackend.fromFile(dirname, 'footer.html'),
})
