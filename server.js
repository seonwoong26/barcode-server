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
  let _query = "INSERT INTO ITEM (code, name, price, qty) VALUES (?, ?, ?, ?)";
  // let _query2 = "SELECT * FROM inventory WHERE(stock) VALUES < (0)"

  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let qty = req.body.qty;

  if (!(name && qty)) {
    console.log('error')
    res.send(401, 'failed')
  }
  if (!qty) {
    qty = 0;
  }


  var query = connection.query(_query, [code, name, price, qty], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }

    console.log(result);

    res.send(200, {
      status: 'ok',
      result: `ITEM is open`
    });
  });
})

app.post('/api/stock_in', (req, res) => {
  let _query = "INSERT INTO STOCK_IN (code, qty, createdDate) VALUES (?, ?, ?)";
  let _query2 = "UPDATE ITEM SET qty = ? where code=?"
  // let _query2 = "UPDATE inventory SET stock = stock + quantity where ean=prod_barcode"
  let code = req.body.code;
  let date_in = moment().format('YYYY-MM-DD HH:mm:ss');
  let qty = req.body.qty



  console.log(date_in)
  console.log(req.body)
  if (!(qty && date_in)) {
    console.log('error')
    res.send(401, 'failed')
  }


  console.log("IN")

  connection.query(_query, [code, qty, date_in], function (err, result) {
    var inputCode = code
    connection.query('SELECT * FROM ITEM WHERE code= ?', [inputCode], (err, resultData) => {
      console.log(resultData[0].qty)
      var addCode = resultData[0].qty
      var addCode_1 = addCode + 1

      connection.query(_query2, [addCode_1, inputCode], function (err, _result) {
        // var addCode = _result
        console.log(_result)
        if (err) {
          console.error(err);
          throw err;
        }
        connection.query('SELECT * FROM ITEM where code=?', [code], function (err, result) {
          console.log(result)
          res.send(201, {
            status: 'ok',
            result: result
          });
        })
      })
    })
    // console.log(result)
    if (err) {
      console.error(err);
      throw err;
 
     }
 
  });

});

app.get('/api/stock_in', (req, res) => {
  connection.query("SELECT * FROM STOCK_IN", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(fields)

    res.send(200, {
      status: 'ok',
      result: result
    });
   });
  })

app.post('/api/stock_out', (req, res) => {
  // INSERT INTO `Barcode`.`in_stock` (`quantity`, `in_datetime`, `prod_barcode`) VALUES ('1', '2020-10-31 00:00:00', '1231231231119');
  let _query = "INSERT INTO stock_out (code, date_out, qty) VALUES (?, ?, ?)";
  let _query2 = "UPDATE ITEM SET qty = qty - ? where code=?"

  let qty = req.body.qty;
  let date_out = moment().format('YYYY-MM-DD HH:mm:ss');
  // let out_datetime = req.body.out_datetime;
  let code = req.body.code;

  console.log(req.body)
  if (!(qty && date_out)) {
    console.log('error')
    return res.send(401, 'failed')
  }
  console.log("OUT")

  let _query3 = "SELECT * FROM ITEM where code=? ;"
  connection.query(_query3, [code], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }
    let item = result[0];
    // 재고 체크
    if (item.qty <= 0) {
      console.log('stock is 0')

      return res.send(401, {
        message: '재고가 0인 상품은 출고를 할 수 없습니다.'
      })
    }
  })

connection.query(_query, [code, qty, date_out], function (err, result) {
  var outputCode = code
  connection.query('SELECT * FROM ITEM WHERE code= ?', [outputCode], (err, resultData) => {
    console.log(resultData[0].qty)
    var DeleteCode = resultData[0].qty
    var DeleteCode_1 = DeleteCode - 1

    connection.query(_query2, [DeleteCode_1, DeleteCode], function (err, _result) {
      // var addCode = _result
      console.log(_result)
      if (err) {
        console.error(err);
        throw err;
      }
      connection.query('SELECT * FROM ITEM where code=?', [code], function (err, result) {
        console.log(result)
        res.send(201, {
          status: 'ok',
          result: result
                // var query = connection.query(_query, [code, date_out, qty], function (err, result) {
                //   if (err) {
                //     console.error(err);
                //     throw err;
                //   }
                //   connection.query(_query2, [code, qty], function (err, result) {
                //     if (err) {
                //       console.error(err);
                //       throw err;
                //     }
                //     item.qty -= 1
                //     return res.send(201, {
                //       status: 'ok',
                //       result: item
                // });
          });
        })
      })
    })
  app.get('/api/stock_out', (req, res) => {
    connection.query("SELECT * FROM stock_out", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      console.log(fields)

      res.send(201, {
        status: 'ok',
        result: result
      });
    });

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
      });
    

      app.listen(port, () => console.log(`Listening on port ${port}`));