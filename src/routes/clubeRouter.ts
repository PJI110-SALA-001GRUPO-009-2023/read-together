import * as config from '../config'

import { Clube } from '@prisma/client'
import express, { Request, } from 'express'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import clubeServiceInstance from '../services/clubeService'
import emailServiceInstance from '../services/emailService'
import { DadosClubeERoleValidacaoCodes, StatusCodes } from '../types/enums'
import validacaoServiceInstance from '../services/validacaoService'
import { RequestDadosDe, RequestDadosOpcionaisDe } from '../types/routes'
import { UsuarioAutenticado } from '../types/services'
import { asyncSha1HexHash, preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'
import { createBlobInContainer } from '../services/blogStorageService'
import { get } from 'http'
import axios from 'axios'

/**
 * Cuida de todas as rotas das funcionalidades pertinentes aos clubes
 * 
 * @desc {/cadastro} rota para a página de criação de clube.
 * @desc {/}
 */
const router = express.Router()
router.use(autenticacaoServiceInstance.authenticate('session'))

router.use((req, res, next) => {
    const user = req.user as UsuarioAutenticado
    if (!user) {
        res.redirect('/login')
    } else {
        next()
    }
})

const _dirBase = 'clube'


router.get('/cadastro', (req, res) => {
    const options = preencherOpcoesDeRender({
        titulo: 'Cadastro de Clube',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('cadastro', _dirBase)
    })

    res.render('clube/cadastro', options)
})

router.post('/cadastro', async (req: Request<null, null, RequestDadosOpcionaisDe<Clube>>, res, next) => {
    const usuario: UsuarioAutenticado | undefined = req.user
    if (!req.user) {
        res.redirect('/login')
        return
    }
    try {
        const dados = validacaoServiceInstance.validarClubeDadosCriacao(req.body)
        const idUsuario = Number(usuario?.idUsuario)
        const clube = await clubeServiceInstance.criarClube(await dados, { idUsuario })
        res.redirect(`${req.baseUrl}/${clube.idClube}`)
    } catch (error) {
        res.locals.redirect = `${req.baseUrl}${req.path}`
        next(error)
    }
})

router.get('/:idClube(\\d+)', async (req: Request<RequestDadosDe<Pick<Clube, 'idClube'>>>, res) => {
    const { idUsuario } = req.user as UsuarioAutenticado
    const { idClube } = req.params
    const DTOValidacaoClubeERegistroEmClube = await clubeServiceInstance.obterDadosClubeRoleSeExistiremClubeUsuario(
        Number(idClube), Number(idUsuario)
    )

    if (!Array.isArray(DTOValidacaoClubeERegistroEmClube)) {
        if (DTOValidacaoClubeERegistroEmClube === DadosClubeERoleValidacaoCodes.CLUBE_NAO_EXISTE) {
            res.redirect('/404')
        } else {
            res.redirect(StatusCodes.UNAUTHORIZED, 'back')
        }
        return
    }

    const membros = await clubeServiceInstance.buscarUsuariosMembrosDoClube(Number(idUsuario), Number(idClube))

    const options = preencherOpcoesDeRender({
        titulo: 'Detalhes sobre o Clube',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('detalhes', _dirBase)
    })

    res.render('clube/detalhes', { ...options, membros, clubeData: DTOValidacaoClubeERegistroEmClube.pop() })
})

router.post('/email', async (req, res) => {
    const { idClube, emailDestinatario } = req.body
    const { idUsuario, nome: nomeAdmin, email: emailAdmin } = req.user as UsuarioAutenticado

    const DTOValidacaoClubeERegistroEmClube = await clubeServiceInstance.obterDadosClubeRoleSeExistiremClubeUsuario(
        Number(idClube), Number(idUsuario)
    )

    if (!Array.isArray(DTOValidacaoClubeERegistroEmClube)) {
        if (DTOValidacaoClubeERegistroEmClube === DadosClubeERoleValidacaoCodes.CLUBE_NAO_EXISTE) {
            res.redirect('/404')
        } else {
            res.redirect(StatusCodes.UNAUTHORIZED, 'back')
        }
        return
    }

    const { admin, nome: nomeClube } = DTOValidacaoClubeERegistroEmClube[0]

    if (!admin) {
        console.log('algo deu errado')
        res.json({ status: 'Nao Autorizado' })
    } else {
        try {
            emailServiceInstance.enviarEmailDeConvite(
                nomeClube,
                nomeAdmin ?? 'nomeFallback',
                emailDestinatario ?? 'jalucas.jall@gmail.com',
                idClube,
                Number(idUsuario),
                emailAdmin || '',
                `${req.protocol}://${req.headers.host}` || '')
            res.json({ status: 'Em processo de envio' })
        } catch (e) {
            console.error(e)
        }
    }
})

router.post('/edicao-conteudo', async (req, res, next) => {
    try {
        const { idUsuario } = req.user as UsuarioAutenticado
        const { id: idClube, base64, ...clubeDados } = req.body

        if (!idUsuario) {
            res.redirect(StatusCodes.UNAUTHORIZED, '/login')
            return
        } else if (!base64 && !clubeDados) {
            res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.BAD_REQUEST, mensagem: 'Não foram enviados para atualizar o clube' })
            return
        }

        let blobUrl = ''
        if (base64) {
            const regex = /^data:(image\/.+);base64,(.+)$/
            const fileMatch = base64.match(regex)
            if (fileMatch) {
                const [, fileType, fileData] = fileMatch
                blobUrl = await createBlobInContainer(fileType, fileData, `_${_dirBase}${idClube}`)
            }
        }

        const clubeDadosAtualizados = {
            idClube,
            ...clubeDados
        }

        if (blobUrl.length > 0)
            clubeDadosAtualizados['imagemUrl'] = blobUrl

        clubeServiceInstance.atualizarInformacaoDoClube(clubeDadosAtualizados, { idUsuario: idUsuario || 0 })


        res.status(StatusCodes.OK).json({ info: 'atualização em andamento' })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ info: 'falha ao atualizar dados' })
        next(error)
    }
})

router.get('/:idClube(\\d+)/reuniao/:idReuniao(\\d+)', async (req, res, next) => {
    try {
        const { idUsuario } = req.user as UsuarioAutenticado
        const { idClube } = req.params

        const DTOValidacaoClubeERegistroEmClube = await clubeServiceInstance.obterDadosClubeRoleSeExistiremClubeUsuario(
            Number(idClube), Number(idUsuario)
        )

        if (!Array.isArray(DTOValidacaoClubeERegistroEmClube)) {
            if (DTOValidacaoClubeERegistroEmClube === DadosClubeERoleValidacaoCodes.CLUBE_NAO_EXISTE) {
                res.redirect('/404')
            } else {
                res.redirect(StatusCodes.UNAUTHORIZED, 'back')
            }
            return
        }

        const { nome, subtitulo } = DTOValidacaoClubeERegistroEmClube[0]
        const hash = await asyncSha1HexHash(nome.concat(idClube))

        const options = preencherOpcoesDeRender({
            titulo: 'Reuniao - Leitura do Mês',
            diretorioBase: _dirBase,
            cssCustomizados: buscarCSS('reuniao', _dirBase)
        })
        res.render('clube/reuniao', { ...options, clubeData: { nome, subtitulo, idClube, hash } })
    } catch (error) {
        next(error)
    }
})

router.get('/:idClube(\\d+)/leitura/:idLeitura(\\d+)', (req, res) => {
    const options = preencherOpcoesDeRender({
        titulo: 'Leitura',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('leitura', _dirBase)
    })

    res.render('clube/leitura', { ...options, leituraData: {id: req.params.idLeitura, idClube: req.params.idClube} })
})

router.get('/leituras', (req, res) => {
    const { clubeId } = req.query

    res.send([
        { titulo: 'Harry Potter e a pedra filosofal', pagina: `/clube/${clubeId}/leitura/1` },
        { titulo: 'Estranhos', pagina: `/clube/${clubeId}/leitura/2` },
        { titulo: 'Admirável mundo novo', pagina: `/clube/${clubeId}/leitura/3` },
    ])
})

router.get('/:idClube(\\d+)/acervo', (req, res) => {
    const options = preencherOpcoesDeRender({
        titulo: 'Acervo',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('acervo', _dirBase)
    })

    res.render('clube/acervo', { ...options, idClube: req.params.idClube })
})

router.post('/:idClube(\\d+)/acervo/search', async (req, res) => {
    const { searchTerms, id } = req.body
    const apiKey = config.GOOGLE_BOOKS_API
    const apiUrl = new URL('https://www.googleapis.com/books/v1/volumes')


    const idMapper = new Map([
        ['1', 'DqvrPgAACAAJ'], // Harry Potter e a pedra filosofal
        ['2', '2_yOPwAACAAJ'], // Strangers/Estranhos, de Dean Koontz
        ['3', 'FfX-AgAAQBAJ'] // Admirável mundo novo
    ])

    if (id) {
        const idStr = String(id)
        const BookIdForGoogle = idMapper.get(idStr)
        apiUrl.pathname += `/${BookIdForGoogle}`
    } else if (searchTerms) {
        apiUrl.searchParams.set('key', apiKey)
        apiUrl.searchParams.set('q', searchTerms)
        apiUrl.searchParams.set('startIndex', '0')
        apiUrl.searchParams.set('maxResults', '40')
        apiUrl.searchParams.set('projection', 'full')
        apiUrl.searchParams.set('filter', 'partial')
        apiUrl.searchParams.set('langRestrict', 'pt-BR')
        apiUrl.searchParams.set('projection', 'full')
    }

    const apiUrlAsString = apiUrl.toString()
    try {
        const apiReponse = await axios.get(apiUrlAsString)
        if (apiReponse.status !== 200) {
            res.json({ error: 'request mal-suscedido' })
            return
        }
        res.json(apiReponse.data)
        
    } catch (error) {
        res.json(error)
    }

})

export default router
