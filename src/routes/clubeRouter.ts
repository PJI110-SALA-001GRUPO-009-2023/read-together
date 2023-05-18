import { Clube } from '@prisma/client'
import express, { Request, } from 'express'
import { RequestDadosDe, RequestDadosOpcionaisDe } from '../types/routes'
import { buscarCSS } from './utils/routesUtilities'
import { preencherOpcoesDeRender } from '../utils'
import validacaoServiceInstance from '../services/validacaoService'
import { esPrismaErro } from '../prisma/prisma'
import clubeServiceInstance from '../services/clubeService'
import { UsuarioAutenticado } from '../types/services'

/**
 * Cuida de todas as rotas das funcionalidades pertinentes aos clubes
 * 
 * @desc {/cadastro} rota para a página de criação de clube.
 * @desc {/}
 */
const router = express.Router()

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
    // TODO alterar quando integrar dados back front
    // Codigo de teste para obter dados de criacao de clube
    // const clube = await clubeServiceInstance.buscarPorId(Number(req.params.idClube))
    // res.send(clube)
    // return
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

    res.render('clube/detalhes', {...options, membros}) 
})

export default router
