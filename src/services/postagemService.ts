import { Postagem, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { LeituraDadosPK, PostagemDadosCriar, UsuarioDadosPK } from '../types/services'
import logger from '../logger'

/**
 * Serviços relacionados às Postagens
 */
export class PostagemService {
    private static logger = logger.child({ contexto: PostagemService.name })
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
            .then(postagem => {
                PostagemService.logger.info('Postagem criada ID: %d', postagem.idPost)
                return postagem
            })
            .catch(err => {
                PostagemService.logger.error(err)
                throw err
            })
    }
}

/**
 * Instância global PostagemService
 */
const postagemServiceInstance: PostagemService = new PostagemService()

export default postagemServiceInstance

