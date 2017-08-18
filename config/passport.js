const LocalStrategy = require('passport-local').Strategy;
const user = require('../modals/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = (passport)=>{
  // Local Strategy
  passport.use(new LocalStrategy((username, password, done)=>{
   
    // Match Username
    let query = {username:username};
    user.findOne(query, (err, user)=>{
      if(err) {
        console.log(err);
      }
      if(!user){
        return done(null, false, {message: 'No user found'});
      }
      if(user){
        console.log(user);
      }
      // Match Password
      bcrypt.compare(password, user.password, (err, isMatch)=>{
        if(err) throw err;
        if(isMatch){
          console.log(user);

          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));

passport.serializeUser(function(user, done) {
  console.log(done)
  done(null, user.id);
});

  passport.deserializeUser((id, done)=> {
    console.log('deserialize Never gets called');
   user.findById(id, (err, user)=> {
     console.log(user);
     done(err, user);
   });
 });
};
