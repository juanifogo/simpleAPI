require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const fs = require('fs')

const port = 3000

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect()

app.use(express.json())

app.get('/data', (req,res)=>{
    connection.query('SELECT * FROM transporte', function (err, rows, fields) {
        if (err) throw err
    
        res.send(rows)
    })
})

app.post('/data/:id', (req, res)=>{
    const {id} = req.params
    const {humedad, temperatura, posicion} = req.body

    if(!humedad || !temperatura || !posicion){
        return res.status(418).send({mensaje: 'I am a teapot!'})
    }

    res.status(200).send({
        valores: `Humedad de ${humedad}%, temperatura de ${temperatura}°C, posicion ${posicion}, con una ID de ${id}`
    })
})
app.listen(port, ()=>{
    console.log(`App listening on port ${port}`)
})