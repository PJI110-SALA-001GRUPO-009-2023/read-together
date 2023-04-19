/* Deve vir no início para permitir debug */
import * as config from './config'

import { IncomingMessage, Server, ServerResponse } from 'http'
import app from './app'
import logger from './logger'
import prismaInstance from './prisma/prisma'

const loggerServidor = logger.child({ contexto: 'Servidor' })
const loggerApp = logger.child({ contexto: 'App' })

const port = config.NODE_PORT

const servidor = app.listen(port, () => {
    loggerServidor.info('Escutando porta: ' + port)
})

// TODO refatorar desligamento suave (graceful shutdown) 
function lidarFecharServidor(this: Server<typeof IncomingMessage, typeof ServerResponse>): void {
    loggerServidor.info('Fechando servidor')
    this.closeAllConnections()
    this.closeIdleConnections()
}

servidor.on('close', lidarFecharServidor)

// HOF - high order function
function hofDesligamentoSuave(servidor: Server<typeof IncomingMessage, typeof ServerResponse>): () => Promise<void> {
    const lidar = async (): Promise<void> => {
        loggerApp.info('Sinal de desligamento recebido')
        try {
            await servidor.close((err) => {
                if (err != undefined) {
                    loggerServidor.error('Erro ao fechar servidor: ', err)
                }
                loggerServidor.info('Servidor fechado')
            })
        } catch (e) {
            loggerServidor.error('Erro %s', JSON.stringify(e))
        } finally {
            loggerApp.info('App desligado')
            logger.end({ level: 'info', message: 'Fechando Logger', contexto: 'Logger' })
            process.exit()
       
        }
    }
    return lidar
}

const lidarDeslgamento = hofDesligamentoSuave(servidor)

process.on('SIGINT', lidarDeslgamento)
process.on('SIGTERM', lidarDeslgamento)

export default app