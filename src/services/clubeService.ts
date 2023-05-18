import { Clube, Prisma, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { UsuarioDadosPK } from '../types/services'
import { RoleEnum } from '../types/enums'
import logger from '../logger'

/**
 * Serviços relacionados aos Clubes
 */
export class ClubeService {
    private static logger = logger.child({ contexto: ClubeService.name })
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
            .then(clube => {
                ClubeService.logger.info('Clube Criado ID: %d', clube.idClube)
                return clube
            })
            .catch(err => {
                ClubeService.logger.error(err)
                throw err
            })
    }

    /**
     * Busca clube por id
     * @param idClube id do Clube a procura
     * @returns 
     */
    public async buscarPorId(idClube: number): Promise<Clube|null> {
        return prismaInstance.clube.findUnique({
            where: {
                idClube: idClube
            }
        })
            .catch(err =>{
                ClubeService.logger.error(err)
                throw err
            })
    }
}

/**
 * Instância global para ClubeService
 */
const clubeServiceInstance: ClubeService = new ClubeService()

export default clubeServiceInstance