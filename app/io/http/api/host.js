import express from 'express'


export default app => {
    const router = express.Router()

    router.get("/", (req, res, next) => {
        res.json([{
            host: "http://0.0.0.0",
            port: "8000"
        }])
    })

    return router
}