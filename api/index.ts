import { PrismaClient } from '@prisma/client'
import express from 'express'

const cors = require('cors')
const prisma = new PrismaClient()
const app = express()

const chkUndef = (element: any) => typeof(element) === 'undefined'

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Bienvenido a la API')
})
    
app.get('/data', async function(req,res) {
    try{
        const result = await prisma.transporte.findMany()
        let output = "GET a /data"
        console.log(output)
        return res.status(200).send(result)
    }
    catch(err){
        res.status(500).send({mensaje: 'Error del servidor'})
        throw err
    }
})

app.post('/data/:tag', async function(req, res) {
    const {tag} = req.params
    const {humedad, temperatura, 'x-pos': x_pos, 'y-pos': y_pos} = req.body
    
    if([humedad, temperatura, x_pos, y_pos].some(chkUndef)){
        let output = 'No puede haber campos vacios'
        console.log(output)
        return res.status(400).send({mensaje: output})
    }

    let id: number

    try{
        const result = await prisma.transporte.findFirst({
            where: {
                tag: tag
            }
        })
        if(!result){
            let output = 'No se encontro una columna con el tag correspondiente'
            console.log(output)
            if(res.headersSent) return
            return res.status(400).send({mensaje: output})
        }
        id = result.id
    }
    
    catch(err){
        res.status(500).send({mensaje: 'Error del servidor'})
        throw err
    }
    
    try{    
        await prisma.transporte.updateMany({
            where: {
                tag: tag
            },
            data: {
                humedad: humedad,
                temperatura: temperatura,
                x_pos: x_pos,
                y_pos: y_pos
            }
        })
        let output = `Humedad: ${humedad}%, temperatura: ${temperatura}°C, X:${x_pos} Y: ${y_pos}, ID: ${id}`
        console.log(output)
        if(res.headersSent) return
        return res.status(200).send({mensaje: output})
    }
    catch(err){
        throw err
    }
})

app.post('/data', async function(req, res) {
    const {humedad, temperatura, 'x-pos': x_pos, 'y-pos': y_pos, tag} = req.body
    
    if([humedad, temperatura, x_pos, y_pos, tag].some(chkUndef)){
        let output = 'No puede haber campos vacios'
        console.log(output)
        return res.status(400).send({mensaje: output})
    }

    try{
        const result = await prisma.transporte.findMany({
            where: {
                tag: tag
            }
        }) 
        if(result.length > 0){
            let output = 'Ya existe una columna con el tag correspondiente'
            console.log(output)
            if(res.headersSent) return
            return res.status(400).send({mensaje: output})
        }
    }
    catch(err){
        res.status(500).send({mensaje: 'Error del servidor'})
        throw err
    }
    
    try{
        const result = await prisma.transporte.create({
            data: {
                humedad: humedad,
                temperatura: temperatura,
                x_pos: x_pos,
                y_pos: y_pos,
                tag: tag
            }
        })
        const id = result.id
        let output = `Recurso creado con ID: ${id}, tag: ${tag}`
        console.log(output)
        if(res.headersSent) return
        return res.status(200).send({mensaje: output})
    }
    catch(err){
        res.status(500).send({mensaje: 'Error del servidor'})
        throw err
    }    
})

app.use((req, res) => {
    res.status(404).send({mensaje: 'No se encontro la ruta'})
})

export default app