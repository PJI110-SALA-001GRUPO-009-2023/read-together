import { Clube, Prisma, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { UsuarioDadosPK } from '../types/services'
import { RoleEnum } from '../types/enums'

/**
 * Serviços relacionados aos Clubes
 */
export class ClubeService {
    /**
     * @param prisma default PrismaClient Global
     */
    constructor(private readonly prisma: PrismaClient = prismaInstance) {
        this.prisma = prisma
    }

    /**
     * Armazena novo clube no banco e adiciona usuário como moderador
     * @param moderador Apenas PK é necessária, restante é ignorado
     */
    public async criarClube(
        this:ClubeService,
        clube: Prisma.ClubeCreateInput,
        moderador: UsuarioDadosPK
    ): Promise<Clube> {
        return this.prisma.clube.create({
            data: {
                ...clube,
                dataCriacao: clube.dataCriacao ?? new Date(Date.now()),
                membroDoClube: {
                    create: {
                        idUsuario: moderador.idUsuario,
                        codRole: RoleEnum.ADMIN
                    }
                }
            }
        })
    }
}

/**
 * Instância global para ClubeService
 */
const clubeServiceInstance: ClubeService = new ClubeService()

export default clubeServiceInstance