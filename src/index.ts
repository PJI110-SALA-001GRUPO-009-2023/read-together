import express from 'express'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.send('Hello Wold!')
})

const port = Number(process.env.NODE_PORT) || 8080

app.listen(port, () => {
    console.log('Listen to port: ' + port)
})