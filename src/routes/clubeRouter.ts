import { Clube } from '@prisma/client'
import express, { Request, } from 'express'
import { RequestDadosDe, RequestDadosOpcionaisDe } from '../types/routes'
import { buscarCSS } from './utils/routesUtilities'

/**
 * Cuida de todas as rotas das funcionalidades pertinentes aos clubes
 * 
 * @desc {/cadastro} rota para a página de criação de clube. Somente um usuários moderador terá acesso autorizado a esta página
 * @desc {/}
 */
const router = express.Router()

const _dirBase = 'clube'

router.get('/cadastro', (req, res) => {
    res.render('clube/cadastro', {
        titulo: 'Cadastro de Clube',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('cadastro', _dirBase)
    })
})

router.post('/cadastro', async (req: Request<null, null, RequestDadosOpcionaisDe<Clube>>, res) => {
    // if (req.session.idUsuario) {
    //     await clubeServiceInstance.criarClube(req.body, {idUsuario: req.session.idUsuario})
    // }
    res.send()
})

router.get('/:idClube(\\d+)', async (req: Request<RequestDadosDe<Pick<Clube, 'idClube'>>>, res) => {
    // const clube = await clubeServiceInstance.buscarPorId(req.params.idClube)
    res.render('clube/detalhes', {
        titulo: 'Detalhes sobre o Clube',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS('detalhes', _dirBase),
        membros: [
            'Charlie Thompson',
            'Samir Grant',
            'Dana Fleming',
            'Elisa O\'Brien',
            'Ana Castillo',
            'Ahmed Wade',
            'Zakir Velazquez',
            'Abdul Mahoney',
            'Clifford Miles',
            'Carlos Moody']
    })
})

export default router
