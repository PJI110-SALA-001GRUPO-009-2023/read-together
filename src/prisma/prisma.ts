import { PrismaClient } from '@prisma/client'
import logger from '../logger'

/**
 * Instância do PrismaClient para uso global
 */
const prismaInstance = new PrismaClient({log: [
    {level: 'info', emit:'event'},
    {level: 'error', emit:'event'}
]})
const loggerPrisma = logger.child({contexto: PrismaClient.name})

prismaInstance.$on('info', (info) => {
    loggerPrisma.info(info.message)
})
prismaInstance.$on('error', (error) => {
    loggerPrisma.error(error.message)
})

export default prismaInstance