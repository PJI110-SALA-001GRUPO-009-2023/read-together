import { Usuario } from '@prisma/client'
import { Request, Router } from 'express'
import { esPrismaErro } from '../prisma/prisma'
import usuarioServiceInstance from '../services/usuarioService'
import validacaoServiceInstance from '../services/validacaoService'
import { RequestDadosOpcionaisDe, UsuarioRequestParams } from '../types/routes'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'
import { randomBytes } from 'crypto'
import clubeServiceInstance from '../services/clubeService'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import { UsuarioAutenticado } from '../types/services'
import { StatusCodes } from '../types/enums'
import { createBlobInContainer } from '../services/blogStorageService'

const router = Router()
router.use(autenticacaoServiceInstance.authenticate('session'))

const _viewFolder = 'usuario'

router.get('/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            res.send(usuario)
        } else {
            res.status(StatusCodes.NOT_FOUND).send()
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

router.get('/editar/:idUsuario(\\d+)?', async (req: Request<UsuarioRequestParams>, res, next) => {
    try {
        const idUsuario = req.params.idUsuario ?? (req.user as UsuarioAutenticado).idUsuario
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        const clube = await clubeServiceInstance.buscaDeClubesRelacionadosAoUsuario({ idUsuario: Number(idUsuario) })
        if (usuario && clube) {
            const opcoes = preencherOpcoesDeRender({
                titulo: 'Detalhes',
                diretorioBase: _viewFolder,
                cssCustomizados: buscarCSS('editar', _viewFolder),
                clubes: clube
            })
            console.log(usuario)
            res.render(`${_viewFolder}/editar`, { ...opcoes, usuario: usuario })
        } else {
            res.status(StatusCodes.NOT_FOUND).send()
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

router.post('/editar/edicao-conteudo', async (req, res, next) => {
    try {
        const { idUsuario } = req.user as UsuarioAutenticado
        const { id: idUsuarioRequest, base64, ...usuarioDados } = req.body

        if (!idUsuario || idUsuario !== idUsuarioRequest) {
            res.redirect(StatusCodes.UNAUTHORIZED, '/login')
            return
        } else if (!base64 && !usuarioDados) {
            res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.BAD_REQUEST, mensagem: 'Não foram enviados para atualizar o clube' })
            return
        }

        let blobUrl = ''
        if (base64) {
            const regex = /^data:(image\/.+);base64,(.+)$/
            const fileMatch = base64.match(regex)!
            const [_, fileType, fileData] = fileMatch
            console.log(fileMatch)
            blobUrl = await createBlobInContainer(fileType, fileData, `_${_viewFolder}${idUsuario}`)
        }

        const usuarioDadosAtualizados = {
            idUsuario,
            ...usuarioDados
        }

        if (blobUrl.length > 0)
            usuarioDadosAtualizados['imagemUrl'] = blobUrl
        
        res.status(StatusCodes.OK).json({ info: 'atualização em andamento' })

        usuarioServiceInstance.atualizarInformacaoDoPerfil(usuarioDadosAtualizados)
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ info: 'falha ao atualizar dados' })
        next(error)
    }
})

export default router