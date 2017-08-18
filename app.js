const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const expressValidator = require('express-validator');
const messages = require('express-messages');
const flash = require('connect-flash');
const config = require('./config/database');
const fs = require('fs');
const multer = require('multer');
const morgan = require('morgan');
const passport = require('passport');

const app = express();

// Passport Config
require('./config/passport')(passport);

// parse middleware
app.use(bodyParser.urlencoded({extended: true}));

// parse application/json
app.use(bodyParser.json());

// Morgan middleware
app.use(morgan('dev'));

// session middleware
//app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// validator middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value)=> {
      var namespace = param.split('.'),
       root    = namespace.shift(),
       formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));




mongoose.connect(config.database);
const db = mongoose.connection;
// check errors
db.on('error', (err)=>{
  console.log(err)
});

// check connection
db.once('open',()=>{
  console.log('connected to mongoose')
});

// importing modals
const blogs = require('./modals/schema');
const user = require('./modals/users');


// setting up public folder
app.use(express.static(path.join(__dirname,'public')))


// listening on port
const port = process.env.PORT || 8000;
app.listen(port,()=>{
  console.log("running on port "+ port);
});

// setting views
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

// routes users
const users = require('./routes/users');
app.use('/users',users);


// routes
app.get('*', (req, res, next)=>{
  res.locals.user = req.user || null;
  console.log(res.locals.user)
  next();
});

app.get('/',(req,res)=>{
  blogs.find({},(err,blogs)=>{

    if(err){
      console.log(err);
      return;
    }else{

      res.render('index',{
        aks: blogs
      });
      //console.log(aks);
      return
    }
  });

});

app.get('/add',(req,res)=>{
  res.render('add.ejs')
});

app.post('/add',(req,res)=>{

  const title = req.body.title;
  const author  = req.body.author;
  const content = req.body.content;
console.log(title);
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();


 let errors = req.validationErrors();

    if(errors){
      req.flash('danger','error');
      res.render('add', {
        errors:errors
      });

     }else{
       const blog = new blogs({
         title:title,
         author:author,
         content:content

       });
       blog.save((err)=>{
           if(err){
             console.log(err);
             return
           }else{
             req.flash('success','Added');
             res.redirect('/');
             return
           }
         });

 }

});

app.get('/edit/:id',(req,res)=>{
  blogs.findById(req.params.id,(err,blog)=>{
    //console.log(blog);
    if(err){
    console.log(err);
      return
    }else{
    //console.log(blog);
    var blog = [blog];
    res.render('edit',{
    blog : blog
    });
      //console.log(Blog)
    }
  });
});

app.post('/edit/:id',(req,res)=>{
  let blog = {};
  blog.title= req.body.title;
  blog.author = req.body.author;
  blog.content = req.body.content;
  let q = {_id:req.params.id};
  blogs.update(q,blog,(err)=>{
    if(err){
    console.log(err);
    return;
    }else{
    req.flash('success','Updated');
    res.redirect('/')
    }

  });

});

app.delete('/delete/:id',(req,res)=>{
 const q = {_id:req.params.id};
  blogs.remove(q,(err)=>{
    if(err){
      console.log(err);
    }else{
      req.flash('success','Deleted');
      res.send('success');
    }
  });
})
