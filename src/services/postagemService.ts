import { Postagem, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { LeituraDadosPK, PostagemDadosCriar, UsuarioDadosPK } from '../types/services'

/**
 * Serviços relacionados às Postagens
 */
export class PostagemService {
    /**
     * @param prisma default PrismaClient Global
     */
    constructor(private readonly prisma: PrismaClient = prismaInstance) {
        this.prisma = prisma
    }

    /**
     * Armazena nova Postagem
     * @param leitura Apenas PK é necessária, restante é ignorado
     * @param usuario Apenas PK é necessária, restante é ignorado
     */
    public async criarPostagem(
        this: PostagemService,
        postagem: PostagemDadosCriar,
        leitura: LeituraDadosPK,
        usuario: UsuarioDadosPK
    ): Promise<Postagem> {
        return this.prisma.postagem.create({
            data: {
                ...postagem,
                leitura: {
                    connect: { idLeitura: leitura.idLeitura }
                },
                usuario: {
                    connect: { idUsuario: usuario.idUsuario }
                }
            }
        })
    }
}

/**
 * Instância global PostagemService
 */
const postagemServiceInstance: PostagemService = new PostagemService()

export default postagemServiceInstance

