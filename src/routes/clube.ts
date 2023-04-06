import express from 'express'
import renderCustomizado from './Utils/renderCustomizado'

/**
 * Cuida de todas as rotas das funcionalidades pertinentes aos clubes
 * 
 * /cadastro => rota para a página de criação de clube. Somente um usuários moderador terá acesso autorizado a esta página
 */
const router = express.Router()

router.get('/cadastro', (req, res) => {
    renderCustomizado(res,
        'clube/cadastro',
        'Cadastro de Clube | Read Together')
})

export default router
