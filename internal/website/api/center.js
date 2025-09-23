import express from 'express'


export default async app => {
    const Center = await app.import('center')
    const router = express.Router({ strict: true })

    router.get(
        "/find-and-connect",
        async (req, res, next) => {
            // #TODO:
            return res.json(Center.list())
        }
    )


    router.get(
        "/",
        async (req, res, next) => {
            return res.json(Center.list())
        }
    )

    return router
}