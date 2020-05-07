const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));
app.use(cors())

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
console.log(conf)
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});
connection.connect();
connection.on('connect', () => console.log('connected'))


const multer = require('multer');
const upload = multer({dest: './upload'})



app.use('/image', express.static('./upload'));

app.get('/api/customers', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    connection.query(
      "SELECT * FROM CUSTOMER WHERE isDeleted = 0",
      (err, rows, fields) => {    
        if ( err ) console.error(err);  
        
        res.send(rows);
       }
    );
});


app.post('/api/customers', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO CUSTOMER VALUES (null, ?, ?, ?, ?, ?, now(), 0)';
  // let image = '/image/' + req.file.filename;
  console.log("cc")
  let image = req.body.image
  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let count = req.body.count;
  let params = [image, code, name, price, count];
  connection.query(sql, params,
    (err, rows, fields) => {
        res.send(rows);
        console.log(rows);
    }
);
  
});

// let sql = 'INSERT INTO STOCK_IN VALUES (null, ?, ?, ?, ?, ?, ?, ? now(), 0)';


app.get('/api/stock_in',  (req, res) => {

  let sql = 'SELECT * FROM STOCK_IN WHERE isDeleted = 0 ';
  // let image = '/image/' + req.file.filename;
  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let count = req.body.count;
  let unit  = req.body.unit ;
  let date_in  = req.body.date_in ;
  let code_in  = req.body.code_in ;
  let params = [code, name, price, count, unit, date_in, code_in];
  connection.query(sql, params,
    (err, rows, fields) => {
      console.log(rows)
        res.send(rows);
        console.log(rows);
    }
);
  
});

app.post('/api/delete/:id', (req, res) => {
    let sql = 'DELETE FROM CUSTOMER WHERE ID = ?' ;
    let params = [req.params.id];
    connection.query(sql, params,
      (err, rows, fields) => {
          res.send(rows);
      }
    )
});

app.post('/api/delete/:id', (req, res) => {
  let sql = 'DELETE FROM STOCK_IN WHERE ID = ?' ;
  let params = [req.params.id];
  connection.query(sql, params,
    (err, rows, fields) => {
        res.send(rows);
    }
  )
});

app.listen(port, () => console.log(`Listening on port ${port}`));