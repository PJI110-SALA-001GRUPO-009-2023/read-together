import { Clube } from '@prisma/client'
import express, { Request, } from 'express'
import { esPrismaErro } from '../prisma/prisma'
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

router.get('/leitura/:idLeitura(\\d+)', (req, res) => {
    const options = preencherOpcoesDeRender({
        titulo: 'Leituras passadas',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('leitura', _dirBase)
    })

    res.render('clube/leitura', { ...options })
})

router.get('/leituras', (req, res) => {
    res.send([
        { titulo: 'The Bald King\'s Braids', pagina: '/clube/leitura/1' },
        { titulo: 'The Jumbo Ant', pagina: '/clube/leitura/2' },
        { titulo: 'The Laughing Tear', pagina: '/clube/leitura/3' },
        { titulo: 'The Whispering Thunder', pagina: '/clube/leitura/4' },
        { titulo: 'The Midnight Sun', pagina: '/clube/leitura/5' },
        { titulo: 'The Frozen Flame', pagina: '/clube/leitura/6' },
        { titulo: 'The Silent Symphony', pagina: '/clube/leitura/7' },
        { titulo: 'The Blind Seer', pagina: '/clube/leitura/8' },
        { titulo: 'The Paper Steel', pagina: '/clube/leitura/9' },
        { titulo: 'The Still Chaos', pagina: '/clube/leitura/10' },
        { titulo: 'The Invisible Spotlight', pagina: '/clube/leitura/11' },
        { titulo: 'The Lost Found', pagina: '/clube/leitura/12' },
        { titulo: 'The Rising Abyss', pagina: '/clube/leitura/13' },
        { titulo: 'The Timeless Clock', pagina: '/clube/leitura/14' },
        { titulo: 'The Colorless Rainbow', pagina: '/clube/leitura/15' }
    ])
})

router.get('/:idClube(\\d+)/acervo', (req, res) => {
    const options = preencherOpcoesDeRender({
        titulo: 'Acervo',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('acervo', _dirBase)
    })

    res.render('clube/acervo', { ...options })
})

export default router
