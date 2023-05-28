import * as config from '../config'
import { PrismaClient } from '@prisma/client'
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime'
import logger from '../logger'

/**
 * Instância do PrismaClient para uso global
 */
const prismaInstance = new PrismaClient({
    log: [
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' }
    ],
    datasources: {
        db: {
            url: config.DATABASE_URL
        }
    }
})

const loggerPrisma = logger.child({ contexto: PrismaClient.name })

prismaInstance.$on('info', (info) => {
    loggerPrisma.info(info.message)
})
prismaInstance.$on('error', (error) => {
    loggerPrisma.error(error.message)
})

/**
 * Verifica se o Erro é do Prisma
 * @param err Erro para checar
 * @returns booelan
 */
export function esPrismaErro(err: unknown) {
    const isPrismaClientKnowReqError = err instanceof PrismaClientKnownRequestError
    const isPrismaClientUnKnowReqError = err instanceof PrismaClientUnknownRequestError
    const isPrismaInitializerError = err instanceof PrismaClientInitializationError
    const isPrismaRustPanicError = err instanceof PrismaClientRustPanicError
    const isPrismaValidationError = err instanceof PrismaClientValidationError
    return isPrismaClientKnowReqError
        || isPrismaClientUnKnowReqError
        || isPrismaInitializerError
        || isPrismaRustPanicError
        || isPrismaValidationError
}

export default prismaInstance