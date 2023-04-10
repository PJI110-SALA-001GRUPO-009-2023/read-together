import * as config from './config'

import { createLogger, format, transports } from 'winston'
import winston from 'winston/lib/winston/config'

const consoleFormato = format.combine(
    format.colorize({
        all: true,
        colors: {
            info: 'green',
            error: 'red',
            warn: 'yellow',
            http: 'blue'
        }
    }),
    format.splat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:MM:ss.ms' }),
    format.printf(({ level, timestamp, message, contexto }) => `${timestamp} [${level}]:${contexto ? ' (' + contexto + ') ' : ''} ${message}`))

const logger = createLogger({
    level: config.WINSTON_LOG_LEVEL,
    levels: winston.npm.levels,
    transports: [
        new transports.Console({ format: consoleFormato })
    ]
})


export const morganStream = {
    write: (message: string) => logger.log({ level: 'http', message: message.trimEnd(), contexto: 'Morgan' })
}

export default logger