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
    ): Promise<Pick<Clube, 'idClube' | 'nome' | 'descricao'>[]> {
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
                ClubeService.logger.debug(clube)
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
        return this.prisma.membroDoClube.findUnique({
            where: {
                idClube_idUsuario_codRole: {
                    codRole: RoleEnum.ADMIN,
                    idClube: idClube,
                    idUsuario: idUsuario
                }
            }
        })
            .then(membro => membro !== null)
            .catch(err => {
                ClubeService.logger.error(err)
                throw err
            })
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
                ClubeService.logger.debug(clube)
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