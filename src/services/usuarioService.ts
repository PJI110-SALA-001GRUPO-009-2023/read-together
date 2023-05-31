import { Prisma, PrismaClient, Usuario } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import logger from '../logger'
import { gerarSenha, limpaCamposVazios } from '../utils'
import { ClubeDadosPK, UsuarioDadosPK } from '../types/services'
import { RoleEnum } from '../types/enums'

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
    public async criarUsuario(
        this: UsuarioService,
        usuario: Prisma.UsuarioCreateInput,
        idClube?: string
    ): Promise<Usuario> {
        const senha = await gerarSenha(usuario.senha)
        const dados = { ...usuario, senha }

        try {
            const usuario = await this.prisma.usuario.create({ data: dados })
            UsuarioService.logger.info('Usuário criado ID: %d', usuario.idUsuario)
            UsuarioService.logger.debug('Dados :', usuario)
            if (idClube) {
                await this.prisma.membroDoClube.create({
                    data: {
                        idClube: Number(idClube),
                        idUsuario: usuario.idUsuario,
                        codRole: RoleEnum.MEMBRO
                    }
                })
                UsuarioService.logger.info('Usuário adicionado como mebro do clube com ID: %d', idClube)
            }

            return usuario
        }
        catch (err) {
            UsuarioService.logger.error(err)
            throw err
        }
    }

    public async atualizarSenha(
        this: UsuarioService,
        usuario: Pick<Usuario, 'email' | 'senha'>
    ): Promise<boolean> {
        const senha = await gerarSenha(usuario.senha)
        const dados = { email: usuario.email, senha }

        try {
            const usuario = await this.prisma.usuario.update({
                data: dados,
                where: {
                    email: dados.email
                }
            })

            if (!usuario) {
                return false
            } else {

                UsuarioService.logger.info('Usuário com ID %d teve sua senha atualizada.', usuario.idUsuario)
                UsuarioService.logger.debug('Dados :', usuario)

                return true
            }
        }
        catch (err) {
            UsuarioService.logger.error(err)
            return false
        }
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

    public async buscarUsuarioPorId(this: UsuarioService, usuario: UsuarioDadosPK)
        : Promise<Omit<Usuario, 'senha'> | null> {
        return this.prisma.usuario.findUnique({
            select: {
                idUsuario: true,
                nome: true,
                dataNascimento: true,
                bio: true,
                imagem: true,
                imagemUrl: true,
                email: true
            },
            where: {
                idUsuario: usuario.idUsuario
            }
        })
            .catch(err => {
                UsuarioService.logger.error(err)
                throw err
            })
    }

    public async verificarSeUsuarioEAdminDoClube(
        this: UsuarioService,
        usuario: UsuarioDadosPK,
        clube: ClubeDadosPK) {
        const usuarioTemRoleAdmin = await this.prisma.membroDoClube.findUnique({
            where: {
                idClube_idUsuario_codRole: {
                    idClube: clube.idClube,
                    idUsuario: usuario.idUsuario,
                    codRole: RoleEnum.ADMIN
                }
            }
        })

        if (!usuarioTemRoleAdmin) {
            logger.error('Usuario não é admin do clube!')
            return false
        }

        const emailPertenceAoUsuarioAdmin = usuario.email && await this.buscarUsuarioPorEmail(usuario.email)
        if (!emailPertenceAoUsuarioAdmin) {
            logger.error('Este e-mail não pertence ao usuário admin')
            return false
        }

        return true
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

    public async atualizarInformacaoDoPerfil(
        this: UsuarioService,
        usuario: UsuarioDadosPK)
        : Promise<boolean> {
        try {
            const { idUsuario, ...usuarioDados } = usuario
            const updateEmUsuario = await this.prisma.usuario.update({
                where: { idUsuario: idUsuario },
                data: usuarioDados
            })

            console.log('update feito:', updateEmUsuario)

            if (!updateEmUsuario) {
                throw new Error('Dados não foram atualizados')
            } else {
                return true
            }
        } catch (err) {
            UsuarioService.logger.error(err)
            return false
        }
    }
}

/**
 * Instância global para UsuarioService
 */
const usuarioServiceInstance: UsuarioService = new UsuarioService()

export default usuarioServiceInstance