import { Usuario } from '@prisma/client'
import { randomBytes } from 'crypto'
import { Request, Router } from 'express'
import { esPrismaErro } from '../prisma/prisma'
import usuarioServiceInstance from '../services/usuarioService'
import validacaoServiceInstance from '../services/validacaoService'
import { RequestDadosOpcionaisDe, UsuarioRequestParams } from '../types/routes'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'

const router = Router()

const _viewFolder = 'usuario'

router.get('/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            res.send(usuario)
        } else {
            res.status(404).send()
        }
    } catch (error) {
        res.redirect(500, 'back')
    }
})

router.get('/cadastro', (req, res) => {
    const opcoes = preencherOpcoesDeRender({
        titulo: 'Cadastro',
        diretorioBase: _viewFolder,
        cssCustomizados: buscarCSS('cadastro', _viewFolder),
        layout: 'layoutHome'
    })

    res.render(`${_viewFolder}/cadastro`, opcoes)
})

router.post('/cadastro', async (req: Request<null, null, RequestDadosOpcionaisDe<Usuario>>, res, next) => {
    try {
        const dados = await validacaoServiceInstance.validarUsuarioDadosCriacao(req.body)
        dados.imagem = randomBytes(2)
        const usuario = await usuarioServiceInstance.criarUsuario(dados)
        res.redirect(`${req.baseUrl}/${usuario.idUsuario}`)
    } catch (error) {
        const redirect = `${req.baseUrl}${req.path}`
        if (error instanceof Error && error.name === 'ValidationError') {
            res.redirect(400, redirect)
            return
        }
        res.redirect(500, redirect)
        if (esPrismaErro(error)) {
            return
        }
        next(error)
    }
})

router.get('/editar/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res, next) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            const opcoes = preencherOpcoesDeRender({
                titulo: 'Detalhes',
                diretorioBase: _viewFolder,
                cssCustomizados: buscarCSS('editar', _viewFolder),
            })
            res.render(`${_viewFolder}/editar`, { ...opcoes, usuario })
        } else {
            res.status(404).send()
        }
    } catch (error) {
        res.redirect(500, 'back')
        if (esPrismaErro(error)) {
            return
        }
        next(error)
    }
})

//TODO remover após integração back-front
router.get('/editarTmp/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res, next) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            const opcoes = preencherOpcoesDeRender({
                titulo: 'Detalhes',
                diretorioBase: _viewFolder,
                cssCustomizados: buscarCSS('editar', _viewFolder),
            })
            res.render(`${_viewFolder}/editarTmp`, { ...opcoes, usuario })
        } else {
            res.status(404).send()
        }
    } catch (error) {
        res.redirect(500, 'back')
        if (esPrismaErro(error)) {
            return
        }
        next(error)
    }
})
router.post('/editar/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams, null, RequestDadosOpcionaisDe<Usuario>>, res, next) => {
    try {
        const { idUsuario } = req.params
        const dados = await validacaoServiceInstance.validarUsuarioDadosEdicao(idUsuario, req.body)
        await usuarioServiceInstance.editarUsuario(dados)
        res.redirect(`${req.baseUrl}/${idUsuario}`)
    } catch (error) {
        const redirect = `${req.baseUrl}${req.path}`
        if (error instanceof Error && error.name === 'ValidationError') {
            res.redirect(400, redirect)
            return
        }
        res.redirect(500, redirect)
        if (esPrismaErro(error)) {
            return
        }
        next(error)
    }
})

export default router