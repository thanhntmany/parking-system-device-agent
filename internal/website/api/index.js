import express from 'express'
import Center from './center.js'
import MasterPassword from './master-password.js'


export default async app => {
    const router = express.Router({ strict: true })

    router.use('/center', await Center(app))
    router.use('/master-password', await MasterPassword(app))

    return router
}