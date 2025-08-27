import page from './page.js'
export default (req, res, next) => {
    if (req.path !== "/" || (req.method !== 'GET' && req.method !== 'HEAD')) return next()

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.send(page.render())
}