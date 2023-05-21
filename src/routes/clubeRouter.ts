import { Clube, Prisma } from '@prisma/client'
import express, { Request, } from 'express'
import { RequestDadosDe, RequestDadosOpcionaisDe } from '../types/routes'
import { buscarCSS } from './utils/routesUtilities'
import { preencherOpcoesDeRender } from '../utils'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import clubeServiceInstance from '../services/clubeService'
import { UsuarioAutenticado, UsuarioDadosPK } from '../types/services'
import emailServiceInstance from '../services/emailService'
import { DadosClubeERoleValidacaoCodes, RoleEnum, StatusCodes } from '../types/enums'
import prismaInstance from '../prisma/prisma'

/**
 * Cuida de todas as rotas das funcionalidades pertinentes aos clubes
 * 
 * @desc {/cadastro} rota para a página de criação de clube.
 * @desc {/}
 */
const router = express.Router()
router.use(autenticacaoServiceInstance.authenticate('session'))
router.use(express.json())

router.use((req, res, next) => {
    const user = req.user as UsuarioAutenticado
    console.log('usuarioAutenticado: ', user)
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

router.post('/cadastro', async (req: Request<null, null, RequestDadosOpcionaisDe<Clube>>, res) => {
    const { idUsuario } = req.user as UsuarioAutenticado
    const clubeInfo = req.body
    await clubeServiceInstance.criarClube(
        clubeInfo as Prisma.ClubeCreateInput,
        { idUsuario: idUsuario } as UsuarioDadosPK)
    res.send()
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

    const membros = [
        'Charlie Thompson',
        'Samir Grant',
        'Dana Fleming',
        'Elisa O\'Brien',
        'Ana Castillo',
        'Ahmed Wade',
        'Zakir Velazquez',
        'Abdul Mahoney',
        'Clifford Miles',
        'Carlos Moody'
    ]

    const options = preencherOpcoesDeRender({
        titulo: 'Detalhes sobre o Clube',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('detalhes', _dirBase)
    })

    res.render('clube/detalhes', { ...options, membros, clubeData: DTOValidacaoClubeERegistroEmClube.pop() })
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

router.post('/email', async (req, res) => {
    const { idClube, emailDestinatario } = req.body
    console.log(idClube, emailDestinatario)
    const { idUsuario, nome } = req.user as UsuarioAutenticado
    const resultadoVerificacao = await clubeServiceInstance.verificarSeEstaRegistradoNoClube(Number(idClube), Number(idUsuario))
    if (resultadoVerificacao === false ||
        resultadoVerificacao[0].codRole !== RoleEnum.ADMIN) {
        console.log('algo deu errado')
        res.json({ status: 'Nao Autorizado' })
    } else {
        try {
            emailServiceInstance.enviarEmailDeConvite('teste', nome ?? 'nomeFallback', 'Fulano', emailDestinatario ?? 'jalucas.jall@gmail.com')
            res.json({ status: 'Em processo de envio' })
        } catch (e) {
            console.error(e)
        }
    }
})

export default router
