import { Clube } from '@prisma/client'
import express, { Request, } from 'express'
import { esPrismaErro } from '../prisma/prisma'
import { autenticacaoServiceInstance } from '../services/autenticacaoService'
import clubeServiceInstance from '../services/clubeService'
import validacaoServiceInstance from '../services/validacaoService'
import { RequestDadosDe, RequestDadosOpcionaisDe } from '../types/routes'
import { UsuarioAutenticado } from '../types/services'
import { preencherOpcoesDeRender } from '../utils'
import { buscarCSS } from './utils/routesUtilities'

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
        const dados = await validacaoServiceInstance.validarClubeDadosCriacao(req.body)
        const idUsuario = Number(usuario?.idUsuario)
        const clube = await clubeServiceInstance.criarClube(dados, {idUsuario})
        res.redirect(`${req.baseUrl}/${clube.idClube}`)
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

router.get('/:idClube(\\d+)', async (req: Request<RequestDadosDe<Pick<Clube, 'idClube'>>>, res) => {
    const clube = await clubeServiceInstance.buscaPorId(Number(req.params.idClube))
    if (!clube) {
        res.redirect('/404')
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

    res.render('clube/detalhes', { ...options, membros, idClube: req.params.idClube })
})

// router.post('/email', async (req, res) => {
//     const { idClube } = req.body
//     const { idUsuario, nome, email } = req.user as UsuarioAutenticado
//     const remetenteModerador = await clubeServiceInstance.verificarSeUsuarioEModeradorDoClube(
//         idClube, Number(idUsuario))
//     if (remetenteModerador) {
//         console.log('algo deu errado')
//         res.json({ status: 'Nao Autorizado' })
//     } else {
//         try {
//             const mail = await emailServiceInstance.enviarEmailDeConvite(
//                 'teste',
//                 nome ?? 'nomeFallback',
//                 'Fulano',
//                 email ?? 'jalucas.jall@gmail.com')
//             res.json({ status: 'Em process de envio' })
//         } catch (e) {
//             console.error(e)
//         }
//     }
// })

export default router
