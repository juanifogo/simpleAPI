require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')

const chkUndef = (element) => typeof(element) === 'undefined'
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Bienvenido a la API')
})
    
app.get('/data', (req,res) => {
    connection.query('SELECT * FROM transporte', (err, rows, fields) => {
        if (err) throw err    
        res.status(200).send(rows)
    })
})

app.post('/data/:tag', (req, res) => {
    const {tag} = req.params
    const {humedad, temperatura, 'x-pos': x_pos, 'y-pos': y_pos} = req.body
    
    if([humedad, temperatura, x_pos, y_pos].some(chkUndef)){
        let output = 'No puede haber campos vacios'
        console.log(output)
        return res.status(400).send({mensaje: output})
    }

    let sql = `SELECT * FROM transporte WHERE tag='${tag}'`
    let id

    connection.query(sql, (err, rows, fields) => {
        if(err) throw err
        if(rows==0){
            let output = 'No se encontro una columna con el tag correspondiente'
            console.log(output)
            if(res.headersSent) return
            return res.status(400).send({mensaje: output})
        }
        if(rows.length != 1) throw new error
        id = rows[0].id
    })
    
    sql = `UPDATE transporte
           SET humedad=${humedad}, temperatura=${temperatura}, \`x-pos\`=${x_pos}, \`y-pos\`=${y_pos}
           WHERE tag='${tag}'`

    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        let output = `Humedad: ${humedad}%, temperatura: ${temperatura}°C, X:${x_pos} Y: ${y_pos}, ID: ${id}`
        console.log(output)
        if(res.headersSent) return
        res.status(200).send({mensaje: output})
    })
})

app.post('/data', (req, res) => {
    const {humedad, temperatura, 'x-pos': x_pos, 'y-pos': y_pos, tag} = req.body
    
    if([humedad, temperatura, x_pos, y_pos, tag].some(chkUndef)){
        let output = 'No puede haber campos vacios'
        console.log(output)
        return res.status(400).send({mensaje: output})
    }

    let sql = `SELECT * FROM transporte WHERE tag='${tag}';`
    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        if(!(rows == 0)){
            let output = 'Ya existe una columna con el tag correspondiente'
            console.log(output)
            if(res.headersSent) return
            return res.status(400).send({mensaje: output})
        }
    })
    
    sql = `INSERT INTO transporte (humedad, temperatura, \`x-pos\`, \`y-pos\`, tag)
           VALUES (${humedad}, ${temperatura}, ${x_pos}, ${y_pos}, '${tag}');`

    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        const id = rows.insertId
        let output = `Recurso creado con ID: ${id}, tag: ${tag}`
        if(res.headersSent) return
        res.status(200).send({mensaje: output})
    })    
})
app.use((req, res) => {
    res.status(404).send({mensaje: 'No se encontro la ruta'})
})

module.exports = app
