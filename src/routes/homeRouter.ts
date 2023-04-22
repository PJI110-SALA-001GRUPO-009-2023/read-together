import express from 'express'
import logger from '../logger'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import { UsuarioAutenticado } from '../types/services'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'

const router = express.Router()


router.get('/', (req, res) => {
    const opcoes = preencherOpcoesDeRender({ cssCustomizados: buscarCSS('index', ''), layout: 'layoutHome'})
    res.render('index', opcoes)
})

router.get('/login', (req, res) => {
    const opcoes = preencherOpcoesDeRender({ titulo: 'Login', cssCustomizados: buscarCSS('login'), layout: 'layoutHome' })
    res.render('login', opcoes)
})

router.post('/login', autenticacaoServiceInstance.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }))
router.get('/logout', (req, res, next) => {
    const opcoes = preencherOpcoesDeRender()
    res.render('logout', opcoes)
})

router.post('/logout', (req, res, next) => {
    const usuario: UsuarioAutenticado | undefined = req.user
    if (!usuario) {
        res.redirect('/')
        return
    }
    const sessionID = req.sessionID
    req.logOut({
        keepSessionInfo: false
    }, (err) => {
        if (err) {
            next(err)
        } else {
            logger.log({ level: 'info', contexto: 'Logout', message: `Sessão destruída ID ${sessionID} para Usuário ID: ${usuario?.idUsuario}` })
            res.redirect('/')
        }
    })
})
export default router
