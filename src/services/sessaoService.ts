import * as config from '../config'

import sessao from 'express-session'
import createMemoryStore from 'memorystore'

const MemoryStore = createMemoryStore(sessao)

const sessaoService = sessao({
    secret: config.SESSAO_SEGREDO,
    store: new MemoryStore({
        checkPeriod: config.SESSAO_PERIODO_CHECK
    }),
    cookie: {
        maxAge: config.SESSAO_MAX_TEMPO
    },
    // Recomendado quando store implementa metodo touch
    resave: false,
    saveUninitialized: false
})

export default sessaoService