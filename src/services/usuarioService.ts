import { Prisma, PrismaClient, Usuario } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import logger from '../logger'
import { gerarSenha, limpaCamposVazios } from '../utils'
import { UsuarioDadosPK } from '../types/services'

/**
 * Serviços relacionados a usuários
 */
export class UsuarioService {
    private static logger = logger.child({ contexto: UsuarioService.name })
    /**
     * @param prisma default PrismaClient Global
     */
    constructor(private readonly prisma: PrismaClient = prismaInstance) {
        this.prisma = prisma
    }

    /**
     * Armazena novo usuário no banco
     */
    public async criarUsuario(this: UsuarioService, usuario: Prisma.UsuarioCreateInput): Promise<Usuario> {
        const senha = await gerarSenha(usuario.senha)
        const dados = { ...usuario, senha }
        return this.prisma.usuario.create({ data: dados })
            .then(usuario => {
                UsuarioService.logger.info('Usuário criado ID: %d', usuario.idUsuario)
                UsuarioService.logger.debug('Dados :', usuario)
                return usuario
            })
            .catch(err => {
                UsuarioService.logger.error(err)
                throw err
            })
    }

    public async buscarUsuarioPorEmail(this: UsuarioService, email: string): Promise<Usuario | null> {
        return this.prisma.usuario.findUnique({
            where: { email: email }
        })
            .catch(err => {
                UsuarioService.logger.error(err)
                throw err
            })
    }

    public async buscarUsuarioPorId(this: UsuarioService, usuario: UsuarioDadosPK): Promise<Usuario | null> {
        return this.prisma.usuario.findUnique({
            where: {
                idUsuario: usuario.idUsuario
            }
        })
            .catch(err => {
                UsuarioService.logger.error(err)
                throw err
            })
    }

    public async editarUsuario(this: UsuarioService, usuario: UsuarioDadosPK): Promise<Usuario> {
        const dadosLimpos = <UsuarioDadosPK>limpaCamposVazios(usuario)
        const senha = usuario.senha ? await gerarSenha(usuario.senha) : undefined
        const dadosParaAtualizar = senha ? { ...dadosLimpos, senha } : { ...usuario }
        return this.prisma.usuario.update({
            data: dadosParaAtualizar,
            where: {
                idUsuario: usuario.idUsuario
            }
        })
            .then(usuario => {
                UsuarioService.logger.info('Usuário editado ID: %d', usuario.idUsuario)
                return usuario
            })
            .catch(err => {
                UsuarioService.logger.error(err)
                throw err
            })
    }
}

/**
 * Instância global para UsuarioService
 */
const usuarioServiceInstance: UsuarioService = new UsuarioService()

export default usuarioServiceInstance