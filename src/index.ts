import express from 'express'
import * as dotenv from 'dotenv'
import { IncomingMessage, Server, ServerResponse } from 'http'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.send('Olá mundo!')
})

const port = Number(process.env.NODE_PORT) || 8080

const servidor = app.listen(port, () => {
    console.log('Escutando porta: ' + port)
})

// TODO refatorar desligamento suave (graceful shutdown) 
function lidarFecharServidor(this: Server<typeof IncomingMessage, typeof ServerResponse>):void {
    console.log('Fechando servidor')
    this.closeAllConnections()
    this.closeIdleConnections()
}

servidor.on('close', lidarFecharServidor)

// HOF - high order function
function hofDesligamentoSuave(servidor: Server<typeof IncomingMessage, typeof ServerResponse>): () => Promise<void> {
    async function lidar(): Promise<void> {
        console.log('Sinal de desligamento recebido ', new Date(Date.now()).toISOString())
        try {
            await servidor.close((err) => {
                if (err != undefined) {
                    console.error('Erro ao fechar servidor: ', err)
                }
                console.log('Servidor fechado')
            })
        } catch(e) {
            console.error('Erro ', e)
        } finally {
            console.log('App desligado', new Date(Date.now()).toISOString())
            process.exit()
        }
    }
    return lidar
}

const lidarDeslgamento = hofDesligamentoSuave(servidor)

process.on('SIGINT', lidarDeslgamento)
process.on('SIGTERM', lidarDeslgamento)