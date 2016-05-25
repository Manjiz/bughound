'use strict';

const 
	fs = require('fs'),

	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	multer = require('multer'),

	api2 = require('./api/'),
	conf = require('./config.js');

let app = express();

/*-----------------------
   中间件
 ------------------------*/
app.use(session({
	secret: 'uft2015bymanjiz',
	cookie: {maxAge: 1000*60*60*24*15},	// 15 days
	resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());
// 解析POST请求参数必需
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/app'));
app.use('/upload', express.static(__dirname+'/upload'));


/*-----------------------
   API
 ------------------------*/
function requireAdmin(req, res, next) {
	if(req.session.isadmin) {
		next();
	} else { 
		res.sendStatus(401);
	}
}
function requireLogined(req, res, next) {
	if(req.session.erp) {
		next();
	} else {
		res.sendStatus(401);
	}
}
app.post('/api/bug/add', api2.demand.add);
app.get('/api/bug/list', api2.demand.list);
app.get('/api/bug/get', api2.demand.get);
app.post('/api/bug/update', requireLogined, api2.demand.update);

app.post('/api/user/add', requireAdmin, api2.user.add);
app.post('/api/user/del', requireAdmin, api2.user.del);
// app.post('/api/user/update', requireAdmin, api.user.update);
app.get('/api/user/list', api2.user.list);
app.post('/api/user/signin', api2.user.signin);
app.post('/api/user/signout', api2.user.signout);
// app.post('/api/user/getpas', api.user.getpas);

app.get('/api/auth', function(req, res) {
	res.send({erp:req.session.erp, name:req.session.name, isAdmin:!!req.session.isadmin})
});
app.post('/api/upload', multer({
	// dest: conf.updir
	storage: multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, conf.updir)
		},
		filename: function(req, file, cb) {
			let now = new Date();
			cb(null, now.getFullYear() + 
				('0' + (now.getMonth()+1)).slice(-2) + 
				('0' + now.getDate()).slice(-2) + 
				('0' + now.getHours()).slice(-2) + 
				('0' + now.getMinutes()).slice(-2) + 
				('0' + now.getSeconds()).slice(-2) + 
				('0' + Math.floor(Math.random()*100)).slice(-2)
			)
		}
	})
}).single('pic'), function(req, res) {
	res.send(req.file.filename);
});

// ----------------------------------------------- //
var server = app.listen(conf.port, function() {
	console.log('UFT Server Listening on port %d', server.address().port);
});