require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB
  }
});


DB_users = knex('users');
DB_login = knex('login');

// knex('users').select('*').then(console.log)

// DB_users.where({email:'srinivaskandari97@gmail.com'}).then(console.log);

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
  bcrypt.hash("sydney", 2).then(hash => {
    console.log(hash);
    bcrypt.compare("sydney", hash).then(res => {
      console.log(res)
    });
  });

});

app.post('/signin', (req, res)=>{
  const {email, password} = req.body;
  DB_login.where('email', '=', email).select('hash').then(data => {
    bcrypt.compare(password, data[0].hash).then(bool => {
      if(bool) res.send(JSON.stringify({status:true}));
      else res.send(JSON.stringify({status:false}));

    });
  });

});

app.post('/register', (req, res) => {
  const {username, email, password} = req.body;
  console.log(username, email, password);
  DB_users.where('email', '=', email).then(data => {
    console.log(data.length);
    if(data.length) {
      res.send(JSON.stringify({status: false}));
      console.log('email exists');
      throw new Error('email exists');
    }
  }).then(() => {
    return bcrypt.hash(password, 5).then(hash => {
      console.log('HASH');
      DB_login.insert({
        email,
        hash
      }).then(() => {
        console.log('logged In');
        return DB_users.insert({
          name: username,
          email,
          joined: new Date(),
          entries: 0
        }).then(() => {
           res.send(JSON.stringify({status: true}))
        });
      })
    })
  }).catch((err) => {
    console.log('err', err);
    res.send(JSON.stringify({status: false}));
  });
});

// app.post('/user')

app.listen(3000);
