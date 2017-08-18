const express= require('express');
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: '../public/uploads' })
const bcrypt = require('bcryptjs')
const user = require('../modals/users');
const passport = require('passport');

// Registering a  user
router.get('/register',(req,res)=>{
  res.render('register.ejs');
});

// adding a user
router.post('/register',(req,res)=>{
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;


  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

 let errors = req.validationErrors();


 if(errors){
   req.flash('danger','error');
   res.render('register', {
     errors:errors
   });

 }
  else {
   const users = new user({
     name:name,
     email:email,
     username:username,
     password:password,

   });
   bcrypt.genSalt(10, (err, salt)=>{
     bcrypt.hash(users.password, salt, (err, hash)=>{
       if(err){
         console.log(err);
       }
       users.password = hash;
       users.save((err)=>{
           if(err){
             console.log(err);
             return
           }else{
             req.flash('success','Added');
             res.redirect('/');
             return
           }
         });
       });
     });

 } 

  });

router.get('/login',(req,res)=>{
  res.render('login');
});

router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res)=>{
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


module.exports= router;
