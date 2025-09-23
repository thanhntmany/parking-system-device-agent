import express from 'express'


export default app => {
    const router = express.Router({ strict: true })

    router.get(
        "/:id/detail",
        async (req, res, next) => {
            const rs = await app.run(app.newContext(), "Camera", "getDetail", { id: req.params.id })
            if (rs?.result) delete rs.result.password
            return res.json(rs)
        }
    )

    return router
}