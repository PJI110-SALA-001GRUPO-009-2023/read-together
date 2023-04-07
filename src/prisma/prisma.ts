import { PrismaClient } from '@prisma/client'

const prismaInstance = new PrismaClient()

/**
 * Instância do PrismaClient para uso global
 */
export default prismaInstance