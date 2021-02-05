const express = require('express');
const app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http)
const url = require('url');
const dbconfig = require('./dbconfig');
const mongoose = require('mongoose');

app.use(express.static("static"));
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

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


    socket.on('disconnect', () => {
      console.log('user disconnected!')
    })
  })



app.get('/', function(req, res){
    res.sendFile(__dirname + '/templates/index.html');
});

app.get('/notify', function(req, res){
    res.sendFile(__dirname + '/templates/notify.html');
});

app.get('/main_page', function(req, res){
    res.sendFile(__dirname + '/templates/demo1/index.html');
})

app.get('/test', function(req, res){
    res.sendFile(__dirname + '/templates/demo1/new_main.html');
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