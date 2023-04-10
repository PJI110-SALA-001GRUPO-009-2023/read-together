import express from 'express'
import clubeRouter from './clube'
import homeRouter from './home'

/**
 * Centraliza todas as rotas para simplificar o arquivo entrypoint
 * @remarks
 * Rotas de clubes e home
 */
const router = express.Router()
router.use('/clube', clubeRouter)
router.use('/', homeRouter)


export default router