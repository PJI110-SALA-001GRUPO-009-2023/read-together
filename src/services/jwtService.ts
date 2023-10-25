import * as config from '../config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import logger from '../logger'
import { JwtValidationResult } from '../types/services'


/**
 * Serviço para gerar e verificar tokens JWT.
 */
export class JwtService {
    private static logger = logger.child({ contexto: JwtService.name })

    /**
     * Chave secreta para assinatura e verificação de tokens JWT.
     */
    #secretKey: string

    constructor() {
        this.#secretKey = config.SEGREDO_JWT
    }

    /**
     * Gera um token JWT assinado com o payload fornecido.
     * @param {JwtPayload} payload - Dados do payload a serem incluídos no token.
     * @param {string} expiresIn - Duração de validade do token (padrão: '4d').
     * @returns {string} - Token JWT gerado.
     */
    sign(payload: JwtPayload, expiresIn = '4d'): string {
        return jwt.sign(payload, this.#secretKey, { expiresIn: expiresIn })
    }

    /**
     * Verifica a validade de um token JWT.
     * @param {string} token - Token JWT a ser verificado.
     * @returns {JwtValidationResult} - Resultado da validação do token.
     */
    verify(token: string): JwtValidationResult {
        try {
            const decoded = jwt.verify(token, this.#secretKey)
            logger.info('jwt correto')
            return { valid: true, payload: decoded }
        } catch (error: any) {
            logger.error(error)
            return { valid: false, error: error.message }
        }
    }
}

/**
 * Serviço (ingênuo) JWT para assinar e verificar um payload qualquer
 */
const jwtServiceInstance = new JwtService()
export default jwtServiceInstance
