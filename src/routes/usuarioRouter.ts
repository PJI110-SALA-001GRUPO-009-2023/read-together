import { Usuario } from '@prisma/client'
import { Request, Router } from 'express'
import usuarioServiceInstance from '../services/usuarioService'
import { RequestDadosOpcionaisDe, UsuarioRequestParams } from '../types/routes'
import { UsuarioDadosPK } from '../types/services'
import { preencherOpcoesDeRender, processaParams } from '../utils'

const router = Router()

const _viewFolder = 'usuario'

router.get('/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            res.send(usuario)
        } else {
            res.status(404).send()
        }
    } catch (error) {
        res.redirect(500, 'back')
    }
})

router.get('/cadastro', (req, res) => {
    const opcoes = preencherOpcoesDeRender()
    res.render(`${_viewFolder}/cadastro`, opcoes)
})

router.post('/cadastro', async (req: Request<null, null, RequestDadosOpcionaisDe<Usuario>>, res) => {
    try {
        const dados = <Usuario>processaParams(req.body)
        const usuario = await usuarioServiceInstance.criarUsuario(dados)
        res.redirect(`${req.baseUrl}/${usuario.idUsuario}`)
    } catch (error) {
        res.redirect(500, `${req.baseUrl}${req.path}`)
    }
})

router.get('/editar/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams>, res) => {
    try {
        const { idUsuario } = req.params
        const usuario = await usuarioServiceInstance.buscarUsuarioPorId({ idUsuario: Number(idUsuario) })
        if (usuario) {
            const opcoes = preencherOpcoesDeRender()
            res.render(`${_viewFolder}/editar`, {...opcoes, usuario})
        } else {
            res.status(404).send()
        }
    } catch (error) {
        res.redirect(500, 'back')
    }
})

router.post('/editar/:idUsuario(\\d+)', async (req: Request<UsuarioRequestParams, null, RequestDadosOpcionaisDe<Usuario>>, res) => {
    try {
        const { idUsuario } = req.params
        const dados = <UsuarioDadosPK>processaParams({...req.body, idUsuario})
        await usuarioServiceInstance.editarUsuario(dados)
        res.redirect(`${req.baseUrl}/${idUsuario}`)
    } catch (error) {
        res.redirect(500, `${req.baseUrl}${req.path}`)
    }
})

export default router