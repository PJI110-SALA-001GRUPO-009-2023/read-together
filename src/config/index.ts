/* Deve vir no incio para permimtir debugs */
import * as dotenv from 'dotenv'
dotenv.config()

import * as utils from '../utils'

export const NODE_PORT: number = Number(process.env.NODE_PORT) || 8080
export const NODE_ENV: string = process.env.NODE_ENV || 'development'

export const SESSAO_SEGREDO: string = process.env.SESSAO_SEGREDO || ''
export const SESSAO_MAX_TEMPO: number = Number(process.env.SESSAO_MAX_TEMPO) || utils.UM_DIA_EM_MS
export const SESSAO_PERIODO_CHECK: number = Number(process.env.SESSAO_PERIODO_CHECK) || utils.UM_DIA_EM_MS

export const WINSTON_LOG_LEVEL: string = process.env.WINSTON_LOG_LEVEL || 'http'

export const COMMUNICATION_SERVICES_CONNECTION_STRING = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING || ''