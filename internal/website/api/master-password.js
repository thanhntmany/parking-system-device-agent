import express from 'express'


export default app => {
    const router = express.Router({ strict: true })

    router.post(
        "/",
        express.json(), async (req, res, next) => {
            req.body.id = req.params.id
            res.json(await app.run(app.newContext(), "Camera", "updateObj", req.body))
        }
    )

    return router
}