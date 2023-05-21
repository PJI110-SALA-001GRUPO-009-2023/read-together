import express from 'express'
import logger from '../logger'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import { UsuarioAutenticado } from '../types/services'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'

const router = express.Router()


router.get('/', (req, res) => {
    const opcoes = preencherOpcoesDeRender({ cssCustomizados: buscarCSS('index', ''), layout: 'layoutHome' })
    res.render('index', opcoes)
})

router.get('/login', (req, res) => {
    if (req.user) {
        const usuario = req.user as UsuarioAutenticado
        res.redirect('/usuario/editar/'+usuario.idUsuario)    
    }
    const opcoes = preencherOpcoesDeRender({ titulo: 'Login', cssCustomizados: buscarCSS('login'), layout: 'layoutHome' })
    res.render('login', opcoes)
})

router.post('/login', autenticacaoServiceInstance.authenticate('local', { failureRedirect: '/login'}),
    (req, res) => {
        const usuario = req.user as UsuarioAutenticado
        const redirectTo = '/usuario/editar'
        res.redirect(`${redirectTo}/${usuario.idUsuario}`)
    }
)

router.post('/logout', (req, res, next) => {
    const usuario = req.user as UsuarioAutenticado
    if (!usuario) {
        res.redirect('/login')
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
            res.redirect('/login')
        }
    })
})

router.get('/404', (req, res) => {
    const options = preencherOpcoesDeRender({ 
        titulo: 'Not Found', 
        layout: 'layoutHome' 
    })

    res.render('404', {...options})
})
export default router
