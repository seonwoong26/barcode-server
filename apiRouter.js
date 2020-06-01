var express = require('express')
const fs = require('fs');
var app = express.Router()
const mysql = require('mysql');

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
});
connection.connect();
// connection.on('connect', () => console.log('connected'))


app.post('/api/delete', (req, res) => {
    var sql = 'DELETE FROM ITEM WHERE name ="abc";'

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }

        console.log(result)
    })
});

module.exports = app;