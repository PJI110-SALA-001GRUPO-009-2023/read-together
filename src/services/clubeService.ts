import { Clube, MembroDoClube, Prisma, PrismaClient, StatusEspera, Usuario } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { ClubeDadosPK, UsuarioDadosPK } from '../types/services'
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
    idClube: number | null;
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
 * @param {Prisma.ClubeCreateInput} clube - Dados do clube a ser criado
 * @param {UsuarioDadosPK} moderador - Apenas PK é necessária, restante é ignorado
 * @returns {Promise<Clube>} - O clube criado
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

    /**
 * Atualiza informações do clube
 * @param {ClubeDadosPK} clube - Dados do clube a ser atualizado
 * @param {UsuarioDadosPK} moderador - Moderador do clube
 * @returns {Promise<boolean>} - Indica se a atualização foi bem-sucedida
 */
    public async atualizarInformacaoDoClube(
        this: ClubeService,
        clube: ClubeDadosPK,
        moderador: UsuarioDadosPK,
    ): Promise<boolean> {
        try {
            const usuarioTemStatusAdmin = await this.prisma.membroDoClube.findUnique({
                where: {
                    idClube_idUsuario_codRole: {
                        idClube: clube.idClube,
                        idUsuario: moderador.idUsuario,
                        codRole: RoleEnum.ADMIN
                    }
                }
            })

            if (!usuarioTemStatusAdmin) {
                ClubeService.logger.error('Usuário não admin não pode sobrescrever dados do clube.')
                throw new Error('Não é admin!')
            }

            console.log(clube)

            const updateEmClube = await this.prisma.clube.update({
                where: { idClube: clube.idClube },
                data: clube
            })

            console.log('update feito:', updateEmClube)

            if (!updateEmClube) {
                throw new Error('Dados não foram atualizados')
            } else {
                return true
            }
        } catch (err) {
            ClubeService.logger.error(err)
            return false
        }
    }

    /**
 * Busca clubes relacionados ao usuário
 * @param {UsuarioDadosPK} usuario - Dados do usuário
 * @returns {Promise<Pick<Clube, 'idClube' | 'nome' | 'descricao'>>} - Clubes relacionados ao usuário
 */
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

    /**
 * Obtém dados do clube e da role do usuário, se existir clube e usuário registrado
 * @param {number} idClube - ID do clube
 * @param {number} idUsuario - ID do usuário
 * @returns {Promise<Array<DadosClubeERole> | DadosClubeERoleValidacaoCodes>>} - Dados do clube e da role do usuário, ou código de validação
 */
    public async obterDadosClubeRoleSeExistiremClubeUsuario(
        this: ClubeService,
        idClube: number,
        idUsuario: number
    ): Promise<Array<DadosClubeERole> | DadosClubeERoleValidacaoCodes> {
        const objetoResultado: Array<any> = await this.prisma.$queryRaw`
            CALL SP_SELECT_DADOS_CLUBE_E_ROLE_SE_USUARIO_FOR_REGISTRADO(${idClube}, ${idUsuario})`
        const objetoResultadoMapeado: DadosClubeERole[] = objetoResultado.map(o => {
            return {
                idClube: o.f0,
                nome: o.f1,
                subtitulo: o.f2 || null,
                descricao: o.f3 || null,
                imagem: o.f4 || null,
                imagemUrl: o.f5 || null,
                site: o.f6 || null,
                whatsapp: o.f7 || null,
                telegram: o.f8 || null,
                redesSociais: o.f9 || null,
                admin: this.SeNaoNuloVerificarRole(o),
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
        if (!o.f10) {
            return null
        } else {
            return o.f10 === 1
        }
    }

    /**
    * Verifica se o usuário está registrado no clube como administrador
    * @param {number} idClube - ID do clube
    * @param {number} idUsuario - ID do usuário
    * @returns {Promise<boolean>} - Indica se o usuário está registrado no clube
    */
    public async verificarSeEstaRegistradoNoClube(
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

    /**
     * Busca clube pelo ID
     * @param {number} idClube - ID do clube
     * @returns {Promise<Clube | null>} - Clube encontrado ou null
     */
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

    /**
     * Busca usuários membros do clube (exceto pelo admin)
     * @param {number} idUsuario - ID do usuário
     * @param {number} idClube - ID do clube
     * @returns {Promise<Pick<Usuario, 'nome'>>} - Usuários membros do clube
     */
    public async buscarUsuariosMembrosDoClube(
        this: ClubeService,
        idUsuario: number,
        idClube: number)
        : Promise<Pick<Usuario, 'nome'>[]> {
        return await this.prisma.usuario.findMany({
            select: {
                nome: true
            },
            where: {
                membroDoClube: {
                    some: {
                        AND: [
                            { idClube: idClube },
                            { NOT: { idUsuario: idUsuario } }
                        ]
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