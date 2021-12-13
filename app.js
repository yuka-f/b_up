const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const e = require('express');
var PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'sqlbaby171819',
//   database: 'beauty_app'
// });

const connection = mysql.createConnection({
  host: 'us-cdbr-east-05.cleardb.net',
  user: 'bc98c4b5065d52',
  password: '0370b0a0',
  database: 'heroku_da8eeee8dfe85c4'
});

connection.connect((error) => {
  if (error) {
      console.error('Database Connect Error:' + error);
      return;
  } else {
      console.log('Database Connection Success: id=' + connection.threadId);
  }
});

app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
)

// =========お客様ログイン確認=======================================
app.use((req,res,next) => {
  if (req.session.userId === undefined) {
    // console.log('ログインしていません');
    res.locals.username = 'ゲスト'
    res.locals.isLoggedIn = false;
  } else {
    // console.log('ログインしています');
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  next();
});

// ==================ルーティング===============================
app.get('/',(req,res) => {
  
  res.render('top.ejs');
});


app.get('/index',(req,res) =>{
  connection.query(
    'SELECT * FROM mission',
    (error,results) => {
      console.log(results);
      res.render('index.ejs',{mission:results});
    }
  );
});

app.get('/new', 

(req, res) => {
  res.render('new.ejs',{errors:[]});
});

app.post('/create',
  (req, res, next) => {
    console.log('入力値の空チェック')
    const itemname = req.body.itemName;
    const errors = [];

    if(itemname === ''){
      errors.push('みっしょんが空です');
    }
    console.log(errors);

    if(errors.length > 0){
      res.render('new.ejs',{errors:errors})
    }else{
      next();
    }
  
  },
  (req,res) => {
  console.log('新規作成')
  connection.query(
    'INSERT INTO mission(name) VALUES(?)',
    [ req.body.itemName ],
    (error,results) => {
      connection.query(
        'SELECT * FROM mission',
        (error, results) => {
          res.redirect('/index');
        }
      );
    }
  )
})

app.post('/delete/:id',(req,res) => {
  connection.query(
    'DELETE FROM mission WHERE id = ?',
    [req.params.id],
    (err,results) => {
      res.redirect('/index');
    }
  );
});

app.get('/edit/:id',(req,res) =>{
  connection.query(
    'SELECT * FROM mission WHERE id = ?',
    [req.params.id],
    (error,results) => {
      res.render('edit.ejs',{item: results[0]});
    }
  );
});

app.post('/update/:id',(req,res) => {
  connection.query(
    'UPDATE mission SET name = ? WHERE id = ?',
    [req.body.itemName,req.params.id],
    (error,results) => {
      res.redirect('/index');
    }
  )
});

var server=app.listen(port,function() {
  console.log("app running on port 8080"); });
// app.listen(PORT);