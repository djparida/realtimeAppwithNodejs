const express = require('express');
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http)
const url = require('url');
const dbconfig = require('./dbconfig');
const mongoose = require('mongoose');
const axios = require('axios');
const qs = require('qs');
const https = require('https');
var cors = require('cors');
var router = express.Router();
const session = require('express-session');


app.use(express.static("static"));
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }))

app.set("view engine", "ejs"); 
app.set("views", __dirname + "/templates"); 
app.use(cors())
app.options('*', cors());
app.use(bodyParser.json())

var userRoutes = require('./router/user.router');
const { Router } = require('express');
const { userInfo } = require('os');

app.use(session({secret: "Shh, its a secret!"}));



// database_connection
mongoose.Promise = global.Promise;
mongoose.connect(dbconfig.url, {
    useNewUrlParser: true
    }).then(() => {
        console.log("Successfully connected to the database");    
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
})

let likes = 0
let notices = 0

io.on('connection', socket => {
    console.log('a user connected!')
    socket.on('likes:updated', () => {
      socket.broadcast.emit('likes:update', likes)
    })

    socket.on('notices:updated', () => {
        socket.broadcast.emit('notices:update', notices)
      })

    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    })  

    socket.on('messaging', function(from,to, msg){
      io.emit('messaging', {'from':from,'to':to,'messages': msg});
    })  


    socket.on('disconnect', () => {
      console.log('user disconnected!')
    })
  })

function checkLogin(req, res, next){
  var userData = req.session.userdata;
  // console.log(userData)
  if(!userData){
    res.redirect('/login');
  }else{
    req.userInfo = userData;
    next();
  }
}

async function userLogin(uname, password){
  var data = JSON.stringify({"username":uname,"password":password});

  var config = {
    method: 'post',
    url: 'http://localhost:3000/api/user/login',
    headers: { 
      'Content-Type': 'application/json', 
    },
    data : data
  };
  const response = await axios(config);
  return response.data;
}

async function getUserInfo(userid){
  var config = {
    method: 'get',
    url: 'http://localhost:3000/api/user/'+userid,
    headers: { 
    }
  };
  const response = await axios(config);
  return response.data;
}

async function getAllUser(){
  var config = {
    method: 'get',
    url: 'http://localhost:3000/api/users',
    headers: { 
    }
  };
  const response = await axios(config);
  return response.data;
}

async function getusersExceptMe(myid){
  var config = {
    method: 'get',
    url: 'http://localhost:3000/api/user_except/'+myid,
    headers: { 
    }
  };
  const response = await axios(config);
  return response.data;
}

app.use('/api',router);
userRoutes(router);

app.get('/',checkLogin, function(req, res){
  res.render('index', {likes:likes})
});

app.get('/notify', function(req, res){
  res.render('notify', {likes:likes,notices:notices})
});

app.get('/main_page', function(req, res){
  res.render('demo1/index')
})

app.get('/test', function(req, res){
  res.render('demo1/new_main')
})

app.get('/chat', function(req, res){
  res.render('demo1/chat')
})

app.get('/login', function(req, res){
  res.render("login")
})

app.post('/login', function(req, res){
  if((!req.body.username) || (!req.body.password)){
    res.send("something went wrong")
  }else{
    var username = req.body.username;
    var password = req.body.password;
    userLogin(username, password).then(data => {
      getUserInfo(data._id).then(data => {
        req.session.userdata = data;
        res.redirect('/chatting')
      }).catch(err => {
        res.status(500).send({
          message:"Something went wrong: "+err.message
        })
      })
    }).catch(err => {
      console.log(err.messages)
    })
  }
})

app.get('/profile',checkLogin, function (req, res){
  var userInfo = req.session.userdata;
  res.render('profile', {userData:userInfo})
})

app.get("/chatting", checkLogin,function(req, res){
  var user = req.userInfo;
  getusersExceptMe(user._id).then(data => {
    var allusers = data;
    var userInfo = req.userInfo;
    res.render('chatting',{userInfo:userInfo, users:allusers})
  }).catch(err => {
    console.log(err.message);
    res.send({
      message:"something went wrong!!!"
    })
  })
})

app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login')
})

app.post('/like', (req, res) => {
    likes++
    res.json({ likes })
  })

app.post('/notice', (req, res) => {
    notice = req.body.notice;
    console.log(notice);
    notices++
    res.json({"msg":notice})
})

http.listen(3000, function(){
    console.log('HTTP server started on port 3000');
});