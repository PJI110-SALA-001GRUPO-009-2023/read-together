import { Clube, Prisma, Usuario } from '@prisma/client'
import Joi from 'joi'
import logger from '../logger'
import { RequestDadosOpcionaisDe } from '../types/routes'
import { ClubeDadosPK, UsuarioDadosPK } from '../types/services'

/**
 * Serviço responsável pela validação de dados do usuário
 * 
 * Atua logo após receber a requisição e valida dados antes da
 * inserção no banco de dados.
 */
export class ValidacaoService {
    private static logger = logger.child({ contexto: ValidacaoService.name})

    private static criarUsuarioSchema = Joi.object<Prisma.UsuarioCreateInput>({
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

    private static criarClubeSchema = Joi.object<Prisma.ClubeCreateInput>({
        nome: Joi.string().required(),
        subtitulo: Joi.string().empty(''),
        descricao: Joi.string().required(),
        imagem: Joi.binary(),
        imagemUrl: Joi.string().empty('').default(null),
        dataCriacao: Joi.date().empty('').default(null),
        categoria: Joi.string().empty('').default(null),
        site: Joi.string().empty('').default(null),
        whatsapp: Joi.string().empty('').default(null),
        telegram: Joi.string().empty('').default(null),
        redesSociais: Joi.string().empty('').default(null)
    })

    private static editarClubeSchema = ValidacaoService.criarClubeSchema.append<ClubeDadosPK>({
        idClube: Joi.number().required()
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

    /**
     * Valida dados para a criação de clube
     * @param dados para criar clube
     * @returns dados validados
     */
    public async validarClubeDadosCriacao(dados: RequestDadosOpcionaisDe<Clube>): Promise<Prisma.ClubeCreateInput> {
        return ValidacaoService.criarClubeSchema.validateAsync(dados)
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