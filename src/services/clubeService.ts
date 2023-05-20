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
        this: ClubeService,
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

    public async buscaDeClubesRelacionadosAoUsuario(
        this: ClubeService,
        usuario: UsuarioDadosPK,
    ): Promise<any> {
        return this.prisma.clube.findMany({
            select: {
                idClube: true,
                nome: true,
                descricao: true
            },
            where: {
                membroDoClube: {
                    some: {
                        usuario: usuario
                    }
                }
            }
        })
            .then(clube => {
                // ClubeService.logger.info(clube)
                return clube
            })
            .catch(err => {
                ClubeService.logger.error(err)
                throw err
            })
    }

    public async verificarSeUsuarioEModeradorDoClube(
        this: ClubeService,
        idClube: number,
        idUsuario: number
    ): Promise<boolean> {
        const idClubeResultado = await this.prisma.clube.findFirst({
            select: {
                idClube: true
            },
            where: {
                membroDoClube: {
                    some: {
                        idUsuario: idUsuario,
                        role: {
                            codRole: RoleEnum.ADMIN
                        }
                    }
                },

            }
        })
        console.log(idClubeResultado)
        if (!idClubeResultado ||
            idClubeResultado.idClube !== idClube) {
            return false
        } else {
            return true
        }
    }


    public async buscaPorId(
        this: ClubeService,
        idClube: number,
    ): Promise<Clube | null> {
        return this.prisma.clube.findUnique({
            where: {
                idClube: idClube
            }
        })
            .then(clube => {
                // ClubeService.logger.info(clube)
                return clube
            })
            .catch(err => {
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