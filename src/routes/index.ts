import express from 'express'
import clubeRouter from './clubeRouter'
import homeRouter from './homeRouter'
import usuarioRouter from './usuarioRouter'
import { preencherOpcoesDeRender } from '../utils'

/**
 * Centraliza todas as rotas para simplificar o arquivo entrypoint
 * @remarks
 * Rotas de clubes e home
 */
const router = express.Router()

router.use('/usuario', usuarioRouter)
router.use('/clube', clubeRouter)
router.use('/', homeRouter)

export default router