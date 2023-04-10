import { Livro, Prisma, PrismaClient } from '@prisma/client'
import prismaInstance from '../prisma/prisma'
import { GeneroLivroDadosPK } from '../types/services'
import logger from '../logger'

/**
 * Serviços relacionados aos Livros
 */
export class LivroService {
    private static logger = logger.child({ contexto: LivroService.name })
    /**
     * @param prisma default PrismaClient Global
     */
    constructor(private readonly prisma: PrismaClient = prismaInstance) {
        this.prisma = prisma
    }

    /**
     * Armazena novo livro
     * @param generoLivro Apenas PK é necessária, restante é ignorado
     */
    public async criarLivroComGenero(
        this: LivroService,
        livro: Prisma.LivroCreateWithoutGeneroLivroInput,
        generoLivro: GeneroLivroDadosPK
    ): Promise<Livro> {
        return this.prisma.livro.create({
            data: {
                ...livro,
                generoLivro: {
                    connect: {
                        codGenero: generoLivro.codGenero
                    }
                }
            }
        })
            .then(livro => {
                LivroService.logger.info('Livro criado: ', livro)
                return livro
            })
            .catch(err => {
                LivroService.logger.error(err)
                throw err
            })
    }

    /**
     * Armazena novo livro e novo genero
     */
    public async criarLivroComNovoGenero(
        this: LivroService,
        livro: Prisma.LivroCreateWithoutGeneroLivroInput,
        generoLivro: Prisma.GeneroLivroCreateInput
    ): Promise<Livro> {
        return this.prisma.livro.create({
            data: {
                ...livro,
                generoLivro: {
                    create: generoLivro
                }
            }
        })
    }
}

/**
 * Instância global para LivroService
 */
const livroServiceInstance: LivroService = new LivroService()

export default livroServiceInstance