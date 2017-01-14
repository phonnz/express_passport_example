
var express							= require('express')
var expressValidator				= require('express-validator')
var exphbs							= require('express-handlebars')
var expressMessages				= require('express-messages')
var path							= require('path')
var bcrypt							= require('bcrypt')
var bodyParser						= require('body-parser')
var cookieParser					= require('cookie-parser')
var flash							= require('connect-flash')
var session							= require('express-session')
var mongoose						= require('mongoose')
var passport						= require('passport')
var passportHttp					= require('passport-http')
var LocalStrategy					= require('passport-local')
mongoose.connect('mongodb://localhost/loginapp_express')

var routes = require('./routes/index')
var users = require('./routes/users')


var app = express()


app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', exphbs({defaultLayout: 'layout'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}))

//Passport
app.use(passport.initialize())
app.use(passport.session())


// In this example, the formParam value is going to get morphed into form body format useful for printing.
// https://github.com/ctavan/express-validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}))


app.use(flash())

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg')	
	res.locals.errro_msg = req.flash('errro_msg')	
	res.locals.error = req.flash('error')	
	next()	
})

app.use('/', routes)
//app.use('/users', users)

app.set('port', (process.env.PORT || 3000))

app.listen(app.get('port'), function(){
	console.log('Server started on port '+ app.get('port'))
})




