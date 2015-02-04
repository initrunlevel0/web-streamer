var express = require('express')
var http = require('http');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var session = require('express-session');
var spawn = require('child_process').spawn;
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

// Load the config
var config = null;
fs.readFile('./config.json', function(err, data) {
    config = JSON.parse(data);
});



var app = express();
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(morgan('combined'));
app.use(session({secret: 'lalalala'}));

var server = require('http').Server(app);
var io = require('socket.io')(server);



if ('development' == app.get('env')) {
    app.use(errorHandler());
}


app.use('/static', express.static(__dirname + '/static'));

app.get('/login', function(req, res) {
    res.render('login.ejs');
});

app.post('/login', function(req, res) {
    if(req.body.password == config.password) {
        req.session.login = true;
        res.redirect('/server');
    } else {
        res.redirect('/login');
    }
});

var verifyLogin = function(req, res, next) {
    if(req.session.login == true) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', function(req, res) {
    res.render('client.ejs');
});

app.get('/server', verifyLogin, function(req, res) {
    res.render('server.ejs');
});

app.get('/logout', verifyLogin, function(req, res) {
    req.session.login = false;
});

var songStarted  = new Date();
var playedStream = "";
app.get('/media', function(req, res) {
    var path = config.media_dir + "/" + require('path').normalize(playedStream);
    var second = (new Date() - songStarted) / 1000.0;
    var ff = ffmpeg(path).format('webm').videoBitrate('96k').audioBitrate('48k').seek(second);
    ff.on('error', function(err) {
        console.log(err.message);
    });
    ff.on('end', function() {
        res.end();
    })
    ff.pipe(res);
});

io.on('connection', function(socket) {
    socket.on('getDir', function(data, callback) {
        data.dir = require('path').normalize(data.dir);
        fs.readdir(config.media_dir + data.dir, function(err, lists) {
            if(!err) {
                lists.push("..");
                var result = [];
                for(i in lists) {
                    result.push({
                        name: lists[i],
                        path: data.dir + "/" + lists[i],
                        isDir: fs.lstatSync(config.media_dir + "/" + data.dir + "/" + lists[i]).isDirectory()
                    });
                }

                callback(result);

            } else {
                callback([]);
            }
        });
    });

    socket.on('playStream', function(data, callback) {
        songStarted = new Date();
        playedStream = data.file;
        socket.broadcast.emit('playStreamClient', data);
        callback();
    });
});



server.listen(5000);
