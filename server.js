const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

var moment = require('moment');
const app = express();
const port = process.env.PORT || 5000;

process.env.TZ = 'Asia/Seoul'

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./database.json');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database,
  timezone: 'Asia/Seoul'
});
connection.connect();


const multer = require('multer');
const upload = multer({ dest: './upload' })


app.get('/api/item', (req, res) => {
  connection.query("SELECT * FROM ITEM", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(fields)

    res.send(200, {
      status: 'ok',
      result: result
    });
  });
});


app.post('/api/item', (req, res) => {
  let _query = "INSERT INTO ITEM (code, name, price, count) VALUES (?, ?, ?)";
  // let _query2 = "SELECT * FROM inventory WHERE(stock) VALUES < (0)"

  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let qty = req.body.qty;
  let params = [code, name, price, qty];

  if (!(product_name && ean)) {
    console.log('error')
    res.send(401, 'failed')
  }
  if (!stock) {
    stock = 0;
  }


  var query = connection.query(_query, [code, name, price, count], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }

    console.log(result);

    res.send(200, {
      status: 'ok',
      result: `inventory is open`
    });
  });
})

app.post('/api/stock_in', (req, res) => {
  let _query = "INSERT INTO STOCK_IN (code, qty, in_datetime) VALUES (?, ?, ?)";
  let _query2 = "UPDATE inventory SET stock = stock + ? where ean=?"
  // let _query2 = "UPDATE inventory SET stock = stock + quantity where ean=prod_barcode"
  let code = req.body.code;
  let in_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
  let qty = req.body.qty



  console.log(in_datetime)
  console.log(req.body)
  if (!(qty && in_datetime)) {
    console.log('error')
    res.send(401, 'failed')
  }


  console.log("IN")

  var query = connection.query(_query, [qty, in_datetime, code], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }


    connection.query(_query2, [qty, code], function (err, _result) {
      if (err) {
        console.error(err);
        throw err;
      }
      connection.query('SELECT * FROM inventory where ean=?', [prod_barcode], function (err, result) {
        res.send(201, {
          status: 'ok',
          result: result
        });
      })


    })

  });
});

app.get('/api/in_stock', (req, res) => {
  connection.query("SELECT * FROM in_stock", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(fields)

    res.send(200, {
      status: 'ok',
      result: result
    });
  });
});


app.post('/api/stock_out', (req, res) => {
  // INSERT INTO `Barcode`.`in_stock` (`quantity`, `in_datetime`, `prod_barcode`) VALUES ('1', '2020-10-31 00:00:00', '1231231231119');
  let _query = "INSERT INTO stock_out (code, out_datetime, qty) VALUES (?, ?, ?)";
  let _query2 = "UPDATE inventory SET stock = stock - ? where ean=?"

  let qty = req.body.qty;
  let out_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
  // let out_datetime = req.body.out_datetime;
  let code = req.body.code;

  console.log(req.body)
  if (!(qty && out_datetime)) {
    console.log('error')
    return res.send(401, 'failed')
  }
  console.log("OUT")

  let _query3 = "SELECT * FROM inventory where ean=? ;"
  connection.query(_query3, [prod_barcode], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }
    let product = result[0];
    // 재고 체크
    if (product.stock <= 0) {
      console.log('stock is 0')

      return res.send(401, {
        message: '재고가 0인 상품은 출고를 할 수 없습니다.'
      })
    }

    var query = connection.query(_query, [qty, out_datetime, code], function (err, result) {
      if (err) {
        console.error(err);
        throw err;
      }
      connection.query(_query2, [qty, code], function (err, result) {
        if (err) {
          console.error(err);
          throw err;
        }
        product.stock -= 1
        return res.send(201, {
          status: 'ok',
          result: product

        });
      })


    });

  })

});



app.get('/api/out_stock', (req, res) => {
  connection.query("SELECT * FROM stock_out", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(fields)

    res.send(201, {
      status: 'ok',
      result: result
    });
  });
});






// const fs = require('fs');
// const express = require('express');
// const bodyParser = require('body-parser');
// var cors = require('cors')
// const app = express();
// const port = process.env.PORT || 5000;



// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors())

// const data = fs.readFileSync('./database.json');
// const conf = JSON.parse(data);
// console.log(conf)
// const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: conf.host,
//   user: conf.user,
//   password: conf.password,
//   port: conf.port,
//   database: conf.database
// });
// connection.connect();
// connection.on('connect', () => console.log('connected'))


// const multer = require('multer');
// const upload = multer({ dest: './upload' })



// app.use('/image', express.static('./upload'));

// app.get('/api/customers', (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   connection.query(
//     "SELECT code, name, price, qty FROM CUSTOMER WHERE (code =?) ",
//     (err, rows, fields) => {
//       if (err) console.error(err);
//       rows.data.
//         res.send(rows);
//     }
//   );
// });

// app.get('/api/stock_in', (req, res) => {
//   connection.query(
//     "SELECT * FROM STOCK_IN",
//     (err, rows, fields) => {
//       if (err) console.error(err);

//       res.send(rows);
//     }
//   );
// });


// // app.get('/api/stock_in', (req, res) => {

// //   let sql = 'SELECT * FROM STOCK_IN';
// //   // let image = '/image/' + req.file.filename;
// //   let code = req.body.code;
// //   let name = req.body.name;
// //   let qty = req.body.qty;
// //   let date_in = req.body.date_in;
// //   let params = [code, name, qty, date_in];
// //   connection.query(sql, params,
// //     (err, rows, fields) => {
// //       console.log(rows)
// //       res.send(rows);
// //       console.log(rows);
// //     }
// //   );
// // });


// app.post('/api/customers', upload.single('image'), (req, res) => {
//   let sql = 'INSERT INTO CUSTOMER ( code, name, price, qty, createdDate, isDeleted) VALUES ( ?, ?, ?, ?, now(), 0)';
//   // let image = '/image/' + req.file.filename;
//   console.log("cc")
//   console.log(req.body)
//   // let image = req.body.image
//   let code = req.body.code;
//   let name = req.body.name;
//   let price = req.body.price;
//   let qty = req.body.qty;
//   let params = [code, name, price, qty];
//   connection.query(sql, params,
//     (err, rows, fields) => {
//       res.send(rows);
//       console.log(rows);
//     }
//   );
// });

// app.post('/api/stock_in', (req, res) => {
//   let sql = 'INSERT INTO STOCK_IN (code, name, qty, date_in, createdDate, isDeleted) VALUES (?, ?, ?, ?, now(), 0)';
//   let code = req.body.code;
//   let name = req.body.name;
//   let qty = req.body.qty;
//   let date_in = req.body.date_in;
//   let params = [code, name, qty, date_in];
//   console.log(req.body)
//   connection.query(sql, params,
//     (err, rows, fields) => {
//       res.send(rows);
//       console.log(rows);
//     }
//   );

//   app.post('/api/customers', (req, res) => {
//     let sql = 'UPDATE CUSTOMER SET Qty=Qty+1 WHERE Code=?';
//     connection.query(sql, [code]);

//   });



//   app.post('/api/delete/:id', (req, res) => {
//     let sql = 'DELETE FROM CUSTOMER WHERE ID = ?';
//     let params = [req.params.id];
//     connection.query(sql, params,
//       (err, rows, fields) => {
//         res.send(rows);
//       }
//     )
//   });

//   app.post('/api/delete/:id', (req, res) => {
//     let sql = 'DELETE FROM STOCK_IN WHERE ID = ?';
//     let params = [req.params.id];
//     connection.query(sql, params,
//       (err, rows, fields) => {
//         res.send(rows);
//       }
//     )
//   });

//   // app.post('/api/scanner', (req, res) => {
//   //   let sql = "INSERT INTO sn (name) VALUES (?)";
//   //   var name = req.body.name
//   //   console.log(req.body)
//   //   let params = [name];
//   //   console.log(params)
//   //   connection.query(sql, params,
//   //     (err, rows) => {
//   //       res.send(rows);
//   //       console.log(rows);
//   //     }
//   //   );
//   // });


//   app.listen(port, () => console.log(`Listening on port ${port}`));