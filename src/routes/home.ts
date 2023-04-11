import express from 'express'
import { buscarCSS } from './utils/routesUtilities'


const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', {
        titulo: 'Home | Read Together',
        diretorioBase: '',
        cssCustomizados: buscarCSS()
    })
})

export default router
