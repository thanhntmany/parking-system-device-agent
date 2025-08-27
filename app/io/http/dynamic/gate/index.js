import express from 'express'
import page from './:id/page.js'

const router = express.Router()

// router.use(/^\//, (req, res, next) => {
//     if (req.path !== "/" || (req.method !== 'GET' && req.method !== 'HEAD')) return next()

//     console.log(req.url)
//     res.setHeader('Content-Type', 'text/html; charset=UTF-8')
//     res.send(page.render())
// })

router.use("/:id", (req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.send(page.render())
})

export default router

