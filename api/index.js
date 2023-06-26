require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')

const chkUndef = (element)=> typeof(element) === 'undefined'
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect()

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Bienvenido a la API')
})

    
app.get('/data', (req,res)=>{
    connection.query('SELECT * FROM transporte', function (err, rows, fields) {
        if (err) throw err
    
        res.status(200).send(rows)
    })
})

app.post('/data/:tag', (req, res)=>{
    const {tag} = req.params
    const {humedad, temperatura, x_pos, y_pos} = req.body
    let sql = `SELECT * FROM transporte WHERE tag='${tag}'`
    let id;
    connection.query(sql, (err, rows, fields)=>{
        if(err) throw err
        if(rows==0){ 
            let output = 'No se encontro la columna con el \'tag\' correspondiente'
            console.log(output)
            return res.status(404).send({mensaje: output})
        }
        if(rows.length != 1) throw new error
        id = rows[0].id
    })
    if([humedad, temperatura, x_pos, y_pos].some(chkUndef)){
        let output = 'No puede haber campos vacios'
        console.log(output)
        return res.status(400).send({mensaje: output})
    }
    sql = `UPDATE transporte
           SET humedad=${humedad}, temperatura=${temperatura}, \`x-pos\`=${x_pos}, \`y-pos\`=${y_pos}
           WHERE tag='${tag}'`
    connection.query(sql, (err, rows, fields)=> {
        if (err) throw err
        res.status(200).send({
            valores: `Humedad de ${humedad}%, temperatura de ${temperatura}°C, posicion X:${x_pos} Y: ${y_pos}, con una ID de ${id}`
        })
    })
})

app.use((req, res)=>{
    res.status(404).send({mensaje: 'No se encontro la ruta'})
})


module.exports = app
