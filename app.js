const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const e = require('express');
var PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sqlbaby171819',
  database: 'beauty_app'
});

// const connection = mysql.createConnection({
//   host: 'us-cdbr-east-05.cleardb.net',
//   user: 'bc98c4b5065d52',
//   password: '0370b0a0',
//   database: 'heroku_da8eeee8dfe85c4'
// });

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

// ===================お客様使用============================================
// ＠-----------新規登録------------＠
// ---ルーティング----
// app.get('/signup',(req,res) => {
//   res.render('signup.ejs',{errors:[]});
// });
// ---ユーザー登録処理---
// app.post('/signup',
//   (req, res, next) => {
//     // 入力値の空チェック
//     const username = req.body.nickname;
//     const fullname = req.body.fullname;
//     const password = req.body.password;
//     const errors = [];

//     if(username === ''){
//       errors.push('ニックネームが空です');
//     }
//     if(fullname === ''){
//       errors.push('フルネームが空です');
//     }
//     if(password === ''){
//       errors.push('パスワードが空です');
//     }
//     console.log(errors);

//     if(errors.length > 0){
//       res.render('signup.ejs',{errors:errors})
//     }else{
//       next();
//     }
//   },
//   (req,res,next) => {
//     // ニックネーム重複チェック
//     const username = req.body.nickname;
//     const errors = [];

//     connection.query(
//       'SELECT * FROM users WHERE username = ?',
//       [username],
//       (error, results) => {
//         if (results.length > 0) {
//           errors.push('ユーザー登録に失敗しました');
//           res.render('signup.ejs',{errors:errors});
//         } else {
//             next();
//           }
//       }
//     );
//   },
//   (req,res) =>{
//       // ユーザー登録
//       const username = req.body.nickname;
//       const fullname = req.body.fullname;
//       const password = req.body.password;
//       bcrypt.hash(password,10,(error,hash) =>{
//         connection.query(
//           'INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
//           [username,hash,fullname],
//           (error, results) => {
//             req.session.userId = results.insertId;
//             req.session.username = username;
        
//             res.redirect('/index');
//           }
//         );
//       });
      
//     }
// );

// // ＠---------ログイン-------------＠
// // ---ルーティング---
// app.get('/login',(req,res) => {
//   res.render('login.ejs');
// })
// // ---ユーザー認証処理---
// app.post('/login',(req,res) => {
//   const nickname = req.body.nickname;
//   connection.query(
//     'SELECT * FROM users WHERE username = ?',
//     [nickname],
//     (error, results) => {
//       if(results.length > 0){
//         const plain = req.body.password;
//         const hash = results[0].password;
        
//         bcrypt.compare(plain,hash,(error,isEqual)=>{
//           if(isEqual){
//             req.session.userId = results[0].id;
//             req.session.username = results[0].username;
//             res.redirect('/index');
//           }else{
//               res.redirect('/login');
//             }
//         });
//       }else{
//           res.redirect('/login');
//         }
//     }
//   )
  
// });

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

// app.get('/logout',(req,res) => {
//   req.session.destroy((error) => {
//     res.redirect('/')
//   })
// });


// var server=app.listen(port,function() {
//   console.log("app running on port 8080"); });
app.listen(PORT);