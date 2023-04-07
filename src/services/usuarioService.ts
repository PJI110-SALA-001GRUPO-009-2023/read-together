import { Prisma, PrismaClient, Usuario } from '@prisma/client'
import prismaInstance from '../prisma/prisma'

/**
 * Serviços relacionados a usuários
 */
export class UsuarioService {
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
    }
}

/**
 * Instância global para UsuarioService
 */
const usuarioServiceInstance: UsuarioService = new UsuarioService()

export default usuarioServiceInstance