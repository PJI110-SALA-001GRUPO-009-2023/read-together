import express from 'express'
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

router.post('/cadastro', (req, res) => {
    res.send()
})

router.get('/detalhes', (req, res) => {
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
