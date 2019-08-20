require('dotenv').config()
const express = require('express');
const https = require('https');
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

var whitelist = ['http://localhost:3001', 'https://localhost:3001','http://localhost:3000','https://localhost:3000',]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

DB_users = knex('users');
DB_login = knex('login');

// knex('users').select('*').then(console.log)

// DB_users.where({email:'srinivaskandari97@gmail.com'}).then(console.log);

const app = express();
app.use(bodyParser.json());
app.use(cors());

  app.post('/', (req, res) => {
    const email = "srinivaskandari97@gmail.com"
    knex('login').where({email}).select('hash').then(data => {
      console.log(data, 'srinivaskandari97@gmail.com');
    }).then(() => {
        knex('login').where('email', '=', 'srinivaskandari97@gmam').select('hash').then(data => {
        console.log(data,'srinivaskandari97@gmam' );
      }).then(() => {
          knex('login').where('email', '=', 'srinivaskandari97@gmail.com').select('hash').then(data => {
          console.log(data, 'srinivaskandari97@gmail.com');
          res.send('HI');
        });
       });

     });
  });



app.post('/signin', (req, res)=>{
  const {email, password} = req.body;
  console.log(email, password);
  knex('login').where({email}).select('hash').then(data => {
    console.log(data, email);
    if(!data.length) { console.log('wrong email'); throw new Error('wrong Email');}
    bcrypt.compare(password, data[0].hash).then(bool => {
      if(!bool) {
        console.log('Wrong Password');
        throw new Error('Wrong Password');
      }
    }).then(() => {
       return knex('users').where('email', '=', email).select('id').then(data => res.json({id: data[0].id}));
    })
    .catch((err) => {
      return res.status(404).send(JSON.stringify({msg:'Wrong Password'}))
    })
  }).catch((err) => {

    return res.status(404).send(JSON.stringify({msg: 'Wrong Email'}))
  });

});

app.post('/register', (req, res) => {
  const {username, email, password} = req.body;
  const hash = bcrypt.hashSync(password, 5);
  knex.transaction(trx => {
    console.log('trxiiiing');
    trx.insert({
      hash,
      email,
    }).into('login')
      .returning('email')
      .then((loginEmail) => {
        console.log('in users');
        return trx.insert({
          email: loginEmail[0],
          entries: 0,
          name: username,
          joined: new Date()
        })
          .into('users')
          .returning('*')
          .then(userData => res.status(200).json({id: userData[0].id}))
      }).then(trx.commit)
        .catch(trx.rollback)
  })
   .catch((err) => res.status(404).json('cannot register'));
});

app.get('/profile/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  knex('users').select('*').where( {id}).then(data =>{
    if(!data.length) res.status(404).json('wrong id bruh');
    else res.json(data[0]);
  }).catch(console.log);
});

app.put('/image', (req,res) => {
  const {id} = req.body;
  console.log(id);
  knex('users').where({id}).increment('entries', 1).returning('entries').then(data => res.json({entries: data[0]}))

})

// var server = https.createServer({}, app);
app.listen(3001, () => console.log("connected"));
