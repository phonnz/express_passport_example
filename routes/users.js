var express = require('express')
var router = express.Router()
var User = require('../models/user')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


router.get('/register', function(req, res){
	res.render('register')

})

router.get('/login', function(req, res){
	res.render('login')

})

router.post('/register', function(req, res){
	var password1 = req.body.password1
	var password2 = req.body.password2
	var email = req.body.email
	

	req.checkBody('email', 'Email is required').notEmpty()
	req.checkBody('password1', 'Password is required').notEmpty()
	req.checkBody('password2', 'Password confirmation is required').notEmpty()	
	req.checkBody('email', 'Email is not valid').isEmail()
	req.checkBody('password1', 'Passwords do not match').equals(password2)

	var errors = req.validationErrors()
	console.log(errors)

	if(errors){
		res.render('register', { notifications: errors })

	}else{
		var newUser = new User({
			email:email,
			username:email,
			password: password1
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			
		});

		res.redirect('/users/login')

	}

})

passport.use(new LocalStrategy(
  function(username, password, done) {//Passport always is expecting username and password params
 
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			
   			return done(null, user);
   		} else {
   			
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.use(new GoogleStrategy({
    clientID: '',
    clientSecret: '',
    callbackURL: "http://localhost:3000/users/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	
	var mainEmail = null
	var is_staff = false
	var emails = profile.emails.map(function(email){
		if(email.value.split('@')[1] === '500startups.com' || email.value.split('@')[1] === '500.co'){
			is_staff = true
			mainEmail = email.value
		}
		return email.value
	})

	if(mainEmail) emails[0] = mainEmail
   User.findOrCreate({ googleId: profile.id, emails: emails, photo: profile.photos[0].value, is_staff : is_staff }, function (err, user) {
   	if(err) throw err

     return done(null, user);
   });
  }
));


passport.serializeUser(function(user, done){
	
	done(null, user.id)
})

passport.deserializeUser(function(id, done){
	
	User.findById(id, function(err, user){
		done(err, user)
	})
})


router.post('/login', 
	passport.authenticate('local', {
		successRedirect: '/', 
		failureRedirect: '/users/login',
		failureFlash: true
	}), function(req, res){
		
		res.redirect('/')
	})

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/');
});

router.get('/auth/google/get',
  passport.authenticate('google', 
  	{ scope: ['https://www.googleapis.com/auth/plus.login',
  				'https://www.googleapis.com/auth/plus.profile.emails.read'] }));



router.get('/auth/google/callback', 
  passport.authenticate('google', { 
  	successRedirect: '/',
  	failureRedirect: '/users/login' }),
  function(req, res) {
  	
    res.redirect('http://localhost:3000/');
  });

module.exports = router