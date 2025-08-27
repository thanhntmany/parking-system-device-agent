import express from 'express'


export default app => {
    const databaseModel = app.models.database

    const router = express.Router()

    router.get("/", async (req, res, next) => res.json(await databaseModel.list(app.newContext())))

    router.get("/:id", async (req, res, next) => res.json(await databaseModel.get(app.newContext(), req.params.id)))

    return router
}