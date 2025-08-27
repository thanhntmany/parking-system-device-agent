import express from 'express'
import path from 'node:path'

export default app => express.static(
    path.join(import.meta.dirname, 'static'),
    {
        fallthrough: true,
        redirect: false,
        cacheControl: true,
        maxAge: '60000',
    }
)