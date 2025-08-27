import StrArBackend from 'parking-system-device-agent/lib/StrArBackend.js'
import _deskPage from '../../desk/page.js'

const page = _deskPage.clone()
page.assign({
    title: StrArBackend.fromFile(import.meta.dirname, 'title.html'),
    body: page.get('body').clone().assign({
        content: StrArBackend.fromFile(import.meta.dirname, 'content.html')
    }),
})

export default page