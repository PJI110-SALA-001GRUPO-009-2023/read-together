import { Clube, MembroDoClube, Prisma, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { PropsExigidosOutrasOpcional, UsuarioDadosPK } from '../types/services'
import { RoleEnum, DadosClubeERoleValidacaoInfo, DadosClubeERoleValidacaoCodes } from '../types/enums'
import logger from '../logger'

interface DadosClubeERole {
    nome: string;
    subtitulo: string;
    descricao: string;
    imagem: string | null;
    imagemUrl: string | null;
    site: string;
    whatsapp: string | null;
    telegram: string | null;
    redesSociais: string | null;
    admin: boolean | null;
}

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
    ): Promise<Partial<Clube>[]> {
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

    public async obterDadosClubeRoleSeExistiremClubeUsuario(
        this: ClubeService,
        idClube: number,
        idUsuario: number
    ): Promise<Array<DadosClubeERole> | DadosClubeERoleValidacaoCodes> {
        const objetoResultado: Array<any> = await this.prisma.$queryRaw`
            CALL SP_SELECT_DADOS_CLUBE_E_ROLE_SE_USUARIO_FOR_REGISTRADO(${idClube}, ${idUsuario})`
        const objetoResultadoMapeado: DadosClubeERole[] = objetoResultado.map(o => {
            return {
                nome: o.f0,
                subtitulo: o.f1 || null,
                descricao: o.f2 || null,
                imagem: o.f3 || null,
                imagemUrl: o.f4 || null,
                site: o.f5 || null,
                whatsapp: o.f6 || null,
                telegram: o.f7 || null,
                redesSociais: o.f8 || null,
                admin: this.SeNaoNuloVerificarRole(o)
            }
        })

        const { nome: ResultadoValidacao } = objetoResultadoMapeado[0]
        if (ResultadoValidacao === DadosClubeERoleValidacaoInfo.CLUBE_NAO_EXISTE) {
            return DadosClubeERoleValidacaoCodes.CLUBE_NAO_EXISTE
        } else if (ResultadoValidacao === DadosClubeERoleValidacaoInfo.USUARIO_NAO_PARTICIPANTE) {
            return DadosClubeERoleValidacaoCodes.USUARIO_NAO_PARTICIPANTE
        } else {
            console.log(objetoResultadoMapeado)
            return objetoResultadoMapeado
        }

    }

    private SeNaoNuloVerificarRole(o: any): boolean | null {
        if (!o.f9) {
            return null
        } else {
            return o.f9 === 1
        }
    }

    public async verificarSeEstaRegistradoNoClube(
        this: ClubeService,
        idClube: number,
        idUsuario: number
    ): Promise<false | PropsExigidosOutrasOpcional<MembroDoClube, 'codRole'>[]> {
        const resObjetoMembro = await this.prisma.clube.findFirst({
            select: {
                membroDoClube: {
                    select: {
                        codRole: true
                    }
                }
            },
            where: {
                membroDoClube: {
                    some: {
                        idUsuario: idUsuario,
                        idClube: idClube
                    }
                },
            }
        })
        console.log(resObjetoMembro)
        if (!resObjetoMembro) {
            return false
        } else {
            return resObjetoMembro.membroDoClube
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