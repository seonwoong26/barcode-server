const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
const upload = multer({ dest: './upload' })



app.use('/image', express.static('./upload'));

app.get('/api/customers', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  connection.query(
    "SELECT code, name, price, qty FROM CUSTOMER WHERE (code =?) ",
    (err, rows, fields) => {
      if (err) console.error(err);
      rows.data.
        res.send(rows);
    }
  );
});

app.get('/api/stock_in', (req, res) => {
  connection.query(
    "SELECT * FROM STOCK_IN",
    (err, rows, fields) => {
      if (err) console.error(err);

      res.send(rows);
    }
  );
});


// app.get('/api/stock_in', (req, res) => {

//   let sql = 'SELECT * FROM STOCK_IN';
//   // let image = '/image/' + req.file.filename;
//   let code = req.body.code;
//   let name = req.body.name;
//   let qty = req.body.qty;
//   let date_in = req.body.date_in;
//   let params = [code, name, qty, date_in];
//   connection.query(sql, params,
//     (err, rows, fields) => {
//       console.log(rows)
//       res.send(rows);
//       console.log(rows);
//     }
//   );
// });


app.post('/api/customers', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO CUSTOMER ( code, name, price, qty, createdDate, isDeleted) VALUES ( ?, ?, ?, ?, now(), 0)';
  // let image = '/image/' + req.file.filename;
  console.log("cc")
  console.log(req.body)
  // let image = req.body.image
  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let qty = req.body.qty;
  let params = [code, name, price, qty];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      console.log(rows);
    }
  );
});

app.post('/api/stock_in', (req, res) => {
  let sql = 'INSERT INTO STOCK_IN (code, name, qty, date_in, createdDate, isDeleted) VALUES (?, ?, ?, ?, now(), 0)';
  let code = req.body.code;
  let name = req.body.name;
  let qty = req.body.qty;
  let date_in = req.body.date_in;
  let params = [code, name, qty, date_in];
  console.log(req.body)
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      console.log(rows);
    }
  );

  app.post('/api/customers', (req, res) => {
    let sql = 'UPDATE CUSTOMER SET Qty=Qty+1 WHERE Code=?';
    connection.query(sql, [code]);

  });



  app.post('/api/delete/:id', (req, res) => {
    let sql = 'DELETE FROM CUSTOMER WHERE ID = ?';
    let params = [req.params.id];
    connection.query(sql, params,
      (err, rows, fields) => {
        res.send(rows);
      }
    )
  });

  app.post('/api/delete/:id', (req, res) => {
    let sql = 'DELETE FROM STOCK_IN WHERE ID = ?';
    let params = [req.params.id];
    connection.query(sql, params,
      (err, rows, fields) => {
        res.send(rows);
      }
    )
  });

  // app.post('/api/scanner', (req, res) => {
  //   let sql = "INSERT INTO sn (name) VALUES (?)";
  //   var name = req.body.name
  //   console.log(req.body)
  //   let params = [name];
  //   console.log(params)
  //   connection.query(sql, params,
  //     (err, rows) => {
  //       res.send(rows);
  //       console.log(rows);
  //     }
  //   );
  // });


  app.listen(port, () => console.log(`Listening on port ${port}`));