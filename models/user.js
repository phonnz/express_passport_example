  'use strict';

var mongoose            = require('mongoose'),
    bcrypt = require('bcrypt');


var Schema = mongoose.Schema



var userSchema = Schema({
  googleId                      : { type: String },
  email                         : { type: String, required : true },
  password                      : { type: String, required : false },
  photo                         : { type: String },
  is_staff                      : { type: Boolean, default: false },
  created                       : { type: Date, default: Date.now },
  

})

var User = mongoose.model('user', userSchema)

module.exports = User;

module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback);
      });
  });
}

module.exports.getUserByUsername = function(email, callback){ 
//passport always will send username from forms, but we can change the name here
  
  var query = {email: email};
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
}

module.exports.findOrCreate = function(user, callback){

  return this.findOne({email: user.emails[0]}, function(err, doc){
  if(err) console.log(err)

  if(!doc){  
      doc = new User({
      googleId: user.googleId,
      email: user.emails[0],
      is_staff : user.is_staff,
      photo: user.photo
    })
    
    doc.save(callback)
  }

  })
}