import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import logger from '../logger'
import { UsuarioAutenticado } from '../types/services'
import { compararSenhaComHash } from '../utils'
import usuarioServiceInstance, { UsuarioService } from './usuarioService'

const loggerLogIn = logger.child({ contexto: 'Login' })
export const criarEstrategiaLocal = (usuarioService: UsuarioService = usuarioServiceInstance) => {
    return new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha',
        passReqToCallback: true,
        session: true
    }, function verify(req, email, senha, cb) {
        if (req.user) { return cb(null, req.user) }
        usuarioService.buscarUsuarioPorEmail(email).then(usuario => {
            if (usuario !== null) {
                return compararSenhaComHash(senha, usuario.senha)
                    .then(es => {
                        if (es) {
                            loggerLogIn.info('Usuário autenticado ID: %d', usuario.idUsuario)
                            cb(null, usuario)
                        } else {
                            loggerLogIn.info('Senha incorreta durante login')
                            cb(null, false, { message: 'Senha incorreta' })
                        }
                    })
                    .catch(err => {
                        loggerLogIn.error(err)
                        cb(err)
                    })
            } else {
                loggerLogIn.info('Usuário não encontrado')
                loggerLogIn.debug(email)
                cb(null, false, { message: 'Usuário ou senha incorreta' })
            }
        }).catch(err => {
            loggerLogIn.error(err)
            cb(err)
        })
    })
}

export function criarAutenticacaoService() {
    return new passport.Passport()
}

export const autenticacaoServiceInstance = criarAutenticacaoService()

autenticacaoServiceInstance.use('local', criarEstrategiaLocal())

autenticacaoServiceInstance.serializeUser<UsuarioAutenticado, Request>((req, usuario: UsuarioAutenticado, cb) => {
    process.nextTick(() => {
        if (usuario.idUsuario && usuario.email && usuario.nome) {
            const { idUsuario, email, nome } = usuario
            loggerLogIn.info('Sessao iniciada ID %s para Usuário ID: %d', req.sessionID, idUsuario)
            cb(null, { idUsuario, email, nome })
        }
    })
})

//TODO entender uso
autenticacaoServiceInstance.deserializeUser<number>((id, cb) => {
    process.nextTick(() => {
        return cb(null, id)
    })
})
