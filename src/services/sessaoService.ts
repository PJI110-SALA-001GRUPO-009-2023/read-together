import sessao from 'express-session'
import createMemoryStore from 'memorystore'
import * as dotenv from 'dotenv'

dotenv.config()

const UM_DIA_EM_MS = 86400000

const MemoryStore = createMemoryStore(sessao)

const sessaoService = sessao({
    secret: process.env.SESSAO_SEGREDO || '',
    store: new MemoryStore({
        checkPeriod: Number(process.env.SESSAO_PERIODO_CHECK) || UM_DIA_EM_MS
    }),
    cookie: {
        maxAge: Number(process.env.SESSAO_MAX_TEMPO) || UM_DIA_EM_MS
    },
    // Recomendado quando store implementa metodo touch
    resave: false,
    saveUninitialized: false
})

export default sessaoService