const express = require('express');
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http)
const url = require('url');
const dbconfig = require('./dbconfig');
const mongoose = require('mongoose');
var cors = require('cors');
var router = express.Router();

const session = require('express-session');
// const flash = require('flash'); 
const flash = require('connect-flash'); 
const api = require('./apicall');

app.use(flash()); 


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


Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
};

var online_array = [];
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

    socket.on('online', function(me){
      if(online_array.includes(me)){
      }else{
        online_array.push(me);
      }
      io.emit('online',{'online':me})
    })

    socket.on('offline', function(me){
      online_array.remove(me);
      io.emit('offline',{'offline':me})
    })


    socket.on('disconnect', () => {
      console.log('user disconnected!')
    })
  })

function checkLogin(req, res, next){
  var userData = req.session.userdata;
  if(!userData){
    res.redirect('/login');
  }else{
    req.userInfo = userData;
    next();
  }
}

function apiProtect(req, res, next){
  if(!req.headers.authorization){
    res.status(401).send({
      message:"Unauthorized"
    })
  }else{
    var data = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
    // var uname = data.split(":")[0]
    // var password = data.split(":")[1]
    if(data == "admin:Admin@123"){
      next()
    }else{
      res.status(400).send({
        message:"Invalid authorization"
      })
    }
  }
}

app.use('/api',apiProtect, router);
userRoutes(router);

app.get('/',checkLogin, function(req, res){
  res.redirect('/chatting')
})

app.get('/likes',checkLogin, function(req, res){
  res.render('index', {likes:likes})
});

app.get('/notify', function(req, res){
  res.render('notify', {likes:likes,notices:notices})
});

app.get('/main_page', function(req, res){
  res.render('demo1/index')
})

app.get('/test', function(req, res){
 res.send("hiii")
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
    api.login(username, password).then(data => {
      req.session.userdata = data;
      res.redirect('/chatting')
    }).catch(err => {
      console.log(err.message)
      // req.flash('message', 'Success!!'); 
      res.redirect('/login')
    })
  }
})


app.get('/register', function(req, res){
  res.render('registration')
})

app.post('/register', function(req, res){
  api.register(req.body.username,req.body.first_name,req.body.last_name,req.body.email,req.body.password)
  .then(data => {
    res.redirect('/login')
  }).catch(err => {
    res.status(400).send({
      message:"something went wrong || "+err.message
    })
  })
})

app.get('/profile',checkLogin, function (req, res){
  var userInfo = req.session.userdata;
  res.render('profile', {userData:userInfo})
})

app.get("/chatting", checkLogin,function(req, res){
  var user = req.userInfo;
  api.users_except_me(user._id).then(data => {
    var allusers = data;
    var userInfo = req.userInfo;
    console.log(online_array);
    res.render('chatting',{userInfo:userInfo, users:allusers, online:online_array})
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