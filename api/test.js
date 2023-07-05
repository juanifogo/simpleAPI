require('dotenv').config()
const mysql = require('mysql2/promise')
const connection = mysql.createConnection(process.env.DATABASE_URL);
connection.connect()

