import { Usuario } from '@prisma/client'
import express, { Request, Router } from 'express'
import { esPrismaErro } from '../prisma/prisma'
import usuarioServiceInstance from '../services/usuarioService'
import validacaoServiceInstance from '../services/validacaoService'
import { RequestDadosOpcionaisDe, UsuarioRequestParams } from '../types/routes'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'
import clubeServiceInstance from '../services/clubeService'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import { ClubeDadosPK, JwtEmailInvitePayload, JwtGuestRegistrationPayload, UsuarioAutenticado, UsuarioDadosPK } from '../types/services'
import { StatusCodes } from '../types/enums'
import { createBlobInContainer } from '../services/blogStorageService'
import jwtServiceInstance from '../services/jwtService'
import logger from '../logger'
import { JwtPayload } from 'jsonwebtoken'

const router = Router()
router.use(autenticacaoServiceInstance.authenticate('session'))

const _viewFolder = 'usuario'

// router.get('/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res) => {
//     try {
//         const { idUsuario } = req.params
//         const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
//         if (usuario) {
//             res.send(usuario)
//         } else {
//             res.status(StatusCodes.NOT_FOUND).send()
//         }
//     } catch (error) {
//         res.redirect(500, 'back')
//     }
// })

router.get('/cadastro', async (req, res) => {
    const tokenRegistroConvidado = req.query['registro-convidado']
    let idClube = 0
    let emailConvidado = ''

    if (tokenRegistroConvidado?.toString()) {

        const resultadoValidacao = jwtServiceInstance.verify(tokenRegistroConvidado?.toString()) as JwtGuestRegistrationPayload
        if (!resultadoValidacao.valid) {
            res.status(401).redirect('/convite-expirado')
            logger.error((resultadoValidacao as JwtPayload).error)
            return
        }


        const payload = resultadoValidacao.payload
        console.log(payload)
        idClube = payload.clubeConvidante
        emailConvidado = payload.emailConvidado

        if (!idClube || !emailConvidado) {
            res.status(400).json({ mensagem: 'Payload com dados incompletos' })
            return
        } else if (!(await clubeServiceInstance.buscaPorId(Number(idClube)))) {
            res.status(404).redirect('/404')
            return
        }
    }

    const opcoes = preencherOpcoesDeRender({
        titulo: 'Cadastro',
        diretorioBase: _viewFolder,
        cssCustomizados: buscarCSS('cadastro', _viewFolder),
        layout: 'layoutHome'
    })

    res.render(`${_viewFolder}/cadastro`, { ...opcoes, emailConvidado, idClube })
})

router.get('/cadastro/convite', async (req, res, next) => {
    const { token } = req.query

    if (!token?.toString()) {
        res.status(400).redirect('/404')
        return
    }

    const resultadoValidacao = jwtServiceInstance.verify(token?.toString()) as JwtEmailInvitePayload
    if (!resultadoValidacao.valid) {
        res.status(401).redirect('/convite-expirado')
        logger.error((resultadoValidacao as JwtPayload).error)
        return
    }

    logger.info('Resultado da validação do token:')
    logger.info(resultadoValidacao)
    const {
        idClube,
        idUsuarioRemetente: idUsuario,
        emailUsuarioRemetente: email,
        emailConvidado
    } = resultadoValidacao.payload
    if (!idClube || !idUsuario || !email || !emailConvidado) {
        res.status(400).json({ mensagem: 'Payload com dados incompletos' })
        return
    }

    const usuario: UsuarioDadosPK = { idUsuario: Number(idUsuario), email }
    const clube: ClubeDadosPK = { idClube: Number(idClube) }
    const confirmacaoDadosConvite = await usuarioServiceInstance.verificarSeUsuarioEAdminDoClube(usuario, clube)
    if (confirmacaoDadosConvite === true) {
        const tokenRegistroConvidado = jwtServiceInstance.sign({ clubeConvidante: idClube, emailConvidado }, '900s') // expira em 15min
        res.redirect(`/usuario/cadastro?registro-convidado=${tokenRegistroConvidado}`)
        logger.info('Convite aceito - redirecionando para página de cadastro (falta adicionar header com um novo token para confirmar esta origem)')
    } else {
        res.redirect('/404')
        logger.info('Alguma coisa errada com o convite')
    }

})


router.post('/cadastro', async (req, res, next) => {
    try {
        console.log(req.body)
        const { idClube, emailConvidado, nome, email, senha } = req.body
        const dados = await validacaoServiceInstance.validarUsuarioDadosCriacao({ nome, email, senha } as Usuario)
        let usuario
        if (idClube && emailConvidado) {
            if (emailConvidado !== dados.email)
                throw new Error('Email fornecido é diferente daquele que recebeu o convite de ingresso no clube.')
            usuario = await usuarioServiceInstance.criarUsuario(dados, idClube)
        } else {
            usuario = await usuarioServiceInstance.criarUsuario(dados)
        }
        res.redirect(`/login`)
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

        usuarioServiceInstance.atualizarInformacaoDoPerfil(usuarioDadosAtualizados)

        res.status(StatusCodes.OK).json({ info: 'atualização em andamento' })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ info: 'falha ao atualizar dados' })
        next(error)
    }
})

export default router