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
// connection.on('connect', () => console.log('connected'))


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

//앱 상품추가
app.post('/api/item', (req, res) => {
  let _query = "INSERT INTO ITEM (code, name, price, qty, date) VALUES (?, ?, ?, ?, ?)";
  // let _query2 = "SELECT * FROM inventory WHERE(stock) VALUES < (0)"

  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let qty = req.body.qty;
  let date = moment().format('YYYY-MM-DD HH:mm:ss');

  if (!(name && qty)) {
    console.log('error')
    res.send(401, 'failed')
  }
  if (!qty) {
    qty = 0;
  }


  var query = connection.query(_query, [code, name, price, qty, date], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    }

    console.log(result);

    res.send(200, '제품이 추가되었습니다');
  });
})

//앱 재고현황
app.post('/api/item2', (req, res) => {

  var _query = 'SELECT * FROM ITEM where code=?'
  var itemCode = req.body.code
  connection.query(_query, [itemCode], function (err, result) {

    console.log(result[0].name)
    res.send("품명:" + result[0].name + " , " + "재고: " + result[0].qty);

  })
})

//앱  입고시작
app.post('/api/stock_in', (req, res) => {
  let _query = "INSERT INTO STOCK_IN (code, qty, date_in) VALUES (?, ?, ?)";
  let _query2 = "UPDATE ITEM SET qty = ? where code=?"
  // let _query2 = "UPDATE inventory SET stock = stock + quantity where ean=prod_barcode"
  let code = req.body.code;
  let qty = req.body.qty;
  let date_in = moment().format('YYYY-MM-DD HH:mm:ss');

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
        connection.query('SELECT * FROM ITEM where code=?', [inputCode], function (err, result) {
          console.log(result[0].qty)
          res.send("품명:" + result[0].name + " , " + "현재수량: " + result[0].qty);
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

    res.send(201, {
      status: 'ok',
      result: result
    });
  });
})
//입고 끝

//앱 출고시작
app.post('/api/stock_out', (req, res) => {
  let _query = "INSERT INTO STOCK_OUT (code, qty, date_out) VALUES (?, ?, ?)";
  let _query2 = "UPDATE ITEM SET qty = ? where code=?"

  let code = req.body.code;
  let date_out = moment().format('YYYY-MM-DD HH:mm:ss');
  let qty = req.body.qty

  console.log(req.body)
  if (!(qty && date_out)) {
    console.log('error')
    return res.send(401, 'failed')
  }
  console.log("OUT")

  connection.query(_query, [code, qty, date_out], function (err, result) {
    var outputCode = code
    connection.query('SELECT * FROM ITEM WHERE code= ?', [outputCode], (err, resultData) => {
      console.log(resultData[0].qty)
      var DeleteCode = resultData[0].qty
      var DeleteCode_1 = DeleteCode - 1
      console.log(DeleteCode_1)

      if (DeleteCode_1 >= 0) {
        connection.query(_query2, [DeleteCode_1, outputCode], function (err, _result) {

          console.log(_result)
          if (err) {
            console.error(err);
            throw err;
          }

          connection.query('SELECT * FROM ITEM where code=?', [outputCode], function (err, result) {
            console.log(result[0].qty)
            res.send("품명:" + result[0].name + " , " + "남은수량: " + result[0].qty);
          })
        })
      }

      else {
        console.log("Empty!!!")
      }
    })

    let _query3 = "SELECT * FROM ITEM where code=? ;"
    connection.query(_query3, [code], function (err, result) {
      if (err) {
        console.error(err);
        throw err;
      }
      let item = result[0];
      // 재고 체크
      if (item.qty <= 0) {
        console.log('item is 0')

        return res.send('재고가 0인 상품은 출고를 할 수 없습니다.')
      }
    })
  })
});
//출고 끝

app.get('/api/stock_out', (req, res) => {
  connection.query("SELECT * FROM STOCK_OUT", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(fields);

    res.send(202, {
      status: 'ok',
      result: result
    });
  })
})


//웹 추가
app.post('/api/item_client', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO ITEM ( code, name, price, qty, date, isDeleted) VALUES ( ?, ?, ?, ?, ?, 0)';
  // let image = '/image/' + req.file.filename;
  console.log("cc")
  console.log(req.body)
  // let image = req.body.image
  let code = req.body.code;
  let name = req.body.name;
  let price = req.body.price;
  let qty = req.body.qty;
  let date = moment().format('YYYY-MM-DD HH:mm:ss');
  let params = [code, name, price, qty, date];

  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      console.log(rows);
    }
  );
});

//웹 입고
app.post('/api/stock_inclient', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO STOCK_IN ( code, qty, date_in) VALUES ( ?, ?, ?)';
  let _query2 = "UPDATE ITEM SET qty = (?) where code= ( ? )"
  // let image = '/image/' + req.file.filename;
  // console.log(req.body)
  let code = req.body.code;
  let qty_1 = req.body.qty;
  let date_in = moment().format('YYYY-MM-DD HH:mm:ss');
  let params = [code, qty_1, date_in];
  console.log(code)
  connection.query(sql, params,
    (err, rows, fields) => {
      let sql2 = 'SELECT qty , code FROM ITEM WHERE code= ? '
      connection.query(sql2, [code], (err, result) => {

        if (result[0] == null) {
          res.send(result);
          console.log("일치하는 코드가 없습니다");
          // res.redirect('/stock_in')
        } else {
          console.log("수량:" + JSON.stringify(result[0].code))
          var intQty = parseInt(result[0].qty) + parseInt(qty_1)

          connection.query(_query2, [intQty, code], (err, results) => {
            if (err) {
              console.log(err)
            } else {
              res.send(result);
              // console.log(results);
            }
          })
        }
      })
    }
  );
});

//웹 출고
app.post('/api/stock_outclient', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO STOCK_OUT ( code, qty, date_out) VALUES ( ?, ?, ?)';
  let _query2 = "UPDATE ITEM SET qty = (?) where code= ( ? )"
  // let image = '/image/' + req.file.filename;
  // console.log(req.body)
  let code = req.body.code;
  let qty_1 = req.body.qty;
  let date_out = moment().format('YYYY-MM-DD HH:mm:ss');
  let params = [code, qty_1, date_out];
  console.log(code)
  connection.query(sql, params,
    (err, rows, fields) => {
      let sql2 = 'SELECT qty , code FROM ITEM WHERE code= ? '
      connection.query(sql2, [code], (err, result) => {


        if (result[0] == null) {
          res.send(result);
          console.log("일치하는 코드가 없습니다");
        } else {
          console.log("수량:" + JSON.stringify(result[0].qty))
          var intQty = parseInt(result[0].qty) - parseInt(qty_1)

          connection.query(_query2, [intQty, code], (err, results) => {
            if (err) {
              console.log(err)
            } else {
              res.send(result);
              // console.log(results);
            }
          })
        }
      })
    }
  );
});

// app.post('/api/delete', (req, res) => {
//   // let sql = 'DELETE FROM ITEM WHERE qty = 3';
//   let params = [req.params.id];
//   connection.query('DELETE FROM ITEM WHERE name ="제품1";',
//     (err, rows) => {
//       if (err) {
//         console.log(err)
//       }
//       res.send(rows);
//     }
//   )
// });

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


app.post('/api/delete/:id', (req, res) => {
  let sql = 'DELETE FROM ITEM WHERE id = ?';
  let params = [req.params.id];
  // console.log(req.params.id)
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      // console.log("Fwefwefwefwe")
    }
  )
});

app.post('/api/delete2/:id', (req, res) => {
  let sql = 'DELETE FROM STOCK_IN WHERE id = ?';
  let params = [req.params.id];
  // console.log(req.params.id)
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      // console.log("Fwefwefwefwe")
    }
  )
});


app.post('/api/delete3/:id', (req, res) => {
  let sql = 'DELETE FROM STOCK_OUT WHERE id = ?';
  let params = [req.params.id];
  // console.log(req.params.id)
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      // console.log("Fwefwefwefwe")
    }
  )
});

app.listen(port, () => console.log(`Listening on port ${port}`));