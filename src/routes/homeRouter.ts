import express from 'express'
import logger from '../logger'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import { UsuarioAutenticado } from '../types/services'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'
import usuarioServiceInstance from '../services/usuarioService'

const router = express.Router()


router.get('/', (req, res) => {
    const opcoes = preencherOpcoesDeRender({ cssCustomizados: buscarCSS('index', ''), layout: 'layoutHome' })
    res.render('index', opcoes)
})

router.get('/login', (req, res) => {
    if (req.user) {
        const usuario = req.user as UsuarioAutenticado
        res.redirect('/usuario/editar/' + usuario.idUsuario)
    }
    const opcoes = preencherOpcoesDeRender({ titulo: 'Login', cssCustomizados: buscarCSS('login'), layout: 'layoutHome' })
    const failureMessage = (req.session as any).messages || ''
    delete (req.session as any).messages // para evitar que a mensagem de erro reapareça se o usuário recarregar a página com aviso de erro
    res.render('login', { ...opcoes, failureMessage })
})

router.get('/recuperar-senha', (req, res) => {
    const opcoes = preencherOpcoesDeRender({ titulo: 'Recuperar Senha', cssCustomizados: buscarCSS('login'), layout: 'layoutHome' })
    res.render('recuperar-senha', opcoes)
})

router.post('/recuperar-senha', async (req, res) => {
    const { email, novaSenha } = req.body
    if (!email || !novaSenha) {
        res.status(400).json({ resultado: 'email ou senha vazios' })
        return
    }

    const existeUsuario = await usuarioServiceInstance.buscarUsuarioPorEmail(email)
    if (!existeUsuario) {
        res.status(400).json({ resultado: 'Usuário nãoe xiste' })
        return
    }

    const atualizacaoSenha = await usuarioServiceInstance.atualizarSenha({ email, senha: novaSenha })
    if (!atualizacaoSenha) {
        res.status(500).json({ resultado: 'Algo deu errado. Não foi possível alterar a senha' })
    } else {
        res.status(204).json({ resultado: 'Senha atualizada com sucesso.' })
    }
})

router.post('/login',
    autenticacaoServiceInstance.authenticate('local', {
        failureRedirect: '/login',
        failureMessage: 'Senha ou email incorretos.'
    }),
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

    res.render('404', { ...options })
})
export default router
