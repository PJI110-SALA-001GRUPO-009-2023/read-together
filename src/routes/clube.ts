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
        titulo: 'Cadastro de Clube | Read Together',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS(_dirBase)
    })
})

router.post('/cadastro', (req, res) => {
    res.send()
})

router.get('/detalhes', (req, res) => {
    res.render('clube/detalhes', {
        titulo: 'Detalhes sobre o Clube | Read Together',
        diretorioBase: _dirBase,
        cssCustomizados: buscarCSS(_dirBase)
    })
})

export default router
