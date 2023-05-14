import { Prisma, Usuario } from '@prisma/client'
import Joi from 'joi'
import logger from '../logger'
import { RequestDadosOpcionaisDe } from '../types/routes'
import { UsuarioDadosPK } from '../types/services'

/**
 * Serviço responsável pela validação de dados do usuário
 * 
 * Atua logo após receber a requisição e valida dados antes da
 * inserção no banco de dados.
 */
export class ValidacaoService {
    private static logger = logger.child({ contexto: ValidacaoService.name})

    private static criarUsuarioSchema = Joi.object<Prisma.UsuarioCreateInput>({
        idUsuario: Joi.number().required(), //TODO remover após atualização de IDs
        senha: Joi.string().required(),
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        dataNascimento: Joi.date().empty('').default(null),
        bio: Joi.string().empty('').default(null),
        imagemUrl: Joi.string().empty('').default(null),
        imagem: Joi.binary()
    })

    private static editarUsuarioSchema = ValidacaoService.criarUsuarioSchema.append<UsuarioDadosPK>({
        idUsuario: Joi.number().required()
    })

    /**
     * Valida dados para criação de novo usuário
     * @param dados para validar
     * @returns dados validados
     */
    public async validarUsuarioDadosCriacao(dados: RequestDadosOpcionaisDe<Usuario>): Promise<Prisma.UsuarioCreateInput> {
        return ValidacaoService.criarUsuarioSchema.validateAsync(dados)
            .then(dados => {
                ValidacaoService.logger.debug('Dados validados: ', dados)
                return dados
            })
            .catch((err: Joi.ValidationError) => {
                ValidacaoService.logger.debug(err)
                throw(err)
            })
    }

    /**
     * Valida dados para edição de usuários
     * @param idUsuario para editar
     * @param dados demais dados a validar
     * @returns dados validados
     */
    public async validarUsuarioDadosEdicao(idUsuario: number, dados: RequestDadosOpcionaisDe<Usuario>): Promise<UsuarioDadosPK> {
        return ValidacaoService.editarUsuarioSchema.validateAsync({idUsuario, ...dados})
            .then(dados => {
                ValidacaoService.logger.debug('Dados validados: ', dados)
                return dados
            })
            .catch((err: Joi.ValidationError) => {
                ValidacaoService.logger.debug(err)
                throw err
            })
    }
}

/**
 * Instância global de ValidacaoService
 * @see ValidacaoService
 */
const validacaoServiceInstance = new ValidacaoService()

export default validacaoServiceInstance