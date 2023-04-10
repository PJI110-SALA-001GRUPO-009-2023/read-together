import { Prisma, PrismaClient, Usuario } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import logger from '../logger'

/**
 * Serviços relacionados a usuários
 */
export class UsuarioService {
    private static logger = logger.child({ contexto: UsuarioService.name})
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
        return this.prisma.usuario.create({ data: usuario })
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
}

/**
 * Instância global para UsuarioService
 */
const usuarioServiceInstance: UsuarioService = new UsuarioService()

export default usuarioServiceInstance