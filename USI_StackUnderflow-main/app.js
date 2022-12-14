//require framework 
const express = require('express');
const path = require('path');
const logger = require('morgan');
const methodOverride = require('method-override');
const multer = require('multer');
const fs = require('fs-extra');
const expresslayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport')
var cors = require("cors");
const redis = require('redis');

const PORT = process.env.PORT || 8000
const REDIS_PORT = process.env.PORT || 6379
// create redis client
const client = redis.createClient(REDIS_PORT);

const { ensureAuthenticated } = require("./config/auth");
const User = require("./model/Users");
const ws = require('./ws');

require('./config/passport')(passport);


//init frameworks
const { createServer } = require("http");
const app = express();
const http = require('http').Server(app);
const server = createServer(app);
const io = require("socket.io")(http,
    {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

app.use(function(req,res,next){
    req.io = io;
    next();
});


// databse config
const db = require('./config/keys').MongoURI;

// connect to mongo
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB APP client connected")
    )
    .catch(err => console.log(err));


//middlewares
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(express.json({ limit: '4MB' }));    // parse application/json
app.use(express.static(path.join(__dirname, 'src/public'), { index: "index.html" }));
app.use(methodOverride('_method'));
app.use(expresslayouts);
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// passport  middleware 
app.use(passport.initialize());
app.use(passport.session());

// connect flash midlware
app.use(flash());
// global vars 
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.logged = req.isAuthenticated();
    next();
});



//controllers
const routers = require("./src/routes");
app.use(routers.home);
app.use('/questions', routers.questions);
app.use('/users', routers.users);
app.use('/tags', routers.tags);
app.use('/notifications', routers.notifications);

//default fallback handlers
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//default fallback handlers
// catch 500 status code
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

//start server
app.set('port', process.env.PORT || 8000);

ws.init(server);

server.on('listening', function () {
    console.log('Express server listening on port ' + server.address().port);
});

server.listen(app.get('port'))

io.attach(server)

//// SOCKET.IO ////
ws.init(server);