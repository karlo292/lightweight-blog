//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
require('dotenv').config({path: __dirname + '/.env'})






const app = express();

let compose = false

let query = ''
let posts = ''

mongoose.connect(process.env['MONGODB'], { useNewUrlParser: true });



const Post = require(__dirname + '/models/postModel')



app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  return next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// parsing the incoming data
app.use(express.json());

app.use(cookieParser());

//username and password
const adminuser = process.env['ADMIN_USER']
const adminpass = process.env['ADMIN_PASS']

// a variable to save a session
var session;


const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: process.env['SESSION_SECRET'],
  saveUninitialized:true,
  cookie: { maxAge: oneDay },
  resave: false
}));



// HOME PAGE

app.get('/', function (req, res) {
  try {
    console.log(req.session)
  } catch (err) {
    console.log(err)
  }


  if (req.session.userid === adminuser) {
    compose = true
  }


  posts = Post.find({}, (error, posts) => {
    if (error) {
      console.error(error);
    } else {
      res.render('home', {
        posts: posts,
        compose: compose,
      })
    }
  });




})

app.post('/', function (req, res) {
  res.redirect('/')
})



// ABOUT PAGE

app.get('/about', function (req, res) {

  res.render('about', {
  })

})

// CONTACT PAGE

app.get('/contact', function (req, res) {

  res.render('contact', {
  })

})

// COMPOSE PAGE

app.get('/compose', function (req, res) {

  if (req.session.userid === adminuser) {
    console.log(req.session)
    res.render('compose')
  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }


})

app.post('/compose', function (req, res) {
  console.log(req.session.userid)
  if (req.session.userid === adminuser) {

    const post = new Post({
      title: req.body.postTitle,
      about: req.body.postAbout,
      content: req.body.postBody
    })
    post.save(function(err){
      if (!err){
        res.redirect("/");
      }
    });

  }
})

// POSTS PAGE

app.get('/posts/:postId', function (req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){

    res.render("post", {
      title: post.title,
      about: post.about,
      content: post.content,
      postId: post._id
    });
  });
})

app.post('/posts/:postId/delete', function (req, res){



  const requestedPostId = req.params.postId;

  if (req.session.userid === adminuser) {

    Post.findOneAndDelete({_id: requestedPostId}, function(err, post){

      if(err){
        console.log(err)
      } else{
        console.log('Successfully deleted post!')
        console.log('ID: ' + requestedPostId)
        console.log('Title: ' + req.params.title)
      }
      res.redirect('/');
    });
  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }

})



app.get('/posts/:postId/edit', function (req,res){
  const requestedPostId = req.params.postId
  if (req.session.userid === adminuser) {
    Post.findOne({_id: requestedPostId}, function(err, post){
      res.render("edit", {
        title: post.title,
        about: post.about,
        content: post.content,
        postId: post._id
      });

    });
  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }

})
app.post('/posts/:postId/edit', function (req,res) {
  const requestedPostId = req.params.postId;

  if (req.session.userid === adminuser) {

    Post.findOne({_id: requestedPostId}, function (err, post) {
      if (err) {
        console.log(err)
      } else {
        console.log('Found post!')
      }
    })

    res.redirect('/posts/' + requestedPostId + '/edit')

  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }
})

app.post('/posts/:postId/edit/done', function (req,res) {
  const requestedPostId = req.params.postId;

  if (req.session.userid === adminuser) {

    let newTitle = req.body.postTitle;
    let newAbout = req.body.postAbout;
    let newContent = req.body.postBody;
    Post.findOneAndUpdate({_id: requestedPostId}, {title: newTitle, content: newContent, about: newAbout}, function(err, post){
      if (err) {
        console.log(err)
        res.redirect('/')
      } else {
        console.log("Document updated");
        post.save()
        res.redirect('/posts/' + requestedPostId)
      }
    });

  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }

})

// SEARCH PAGE

app.get('/search', function(req, res) {

  console.log(query)
  console.log(posts)
  res.render('search', {
    query: query,
    posts: posts
  });
});

app.post('/search', function(req, res) {
  query = req.body.query;
  console.log(query);
  Post.find({ title: { $regex: query, $options: "i" } })
      .then(posts => {
        res.render('search', {
          query: query,
          posts: posts
        });
      })
      .catch(err => {
        console.error(err);
      });


});

// Login & Register
// THIS IS MADE ONLY FOR ADMINS!!!
app.get('/login',(req,res) => {

  if(req.session.userid){
    res.render('user')
  }else
    res.render('login', {

    })
});

app.post('/user',(req,res) => {
  if(req.body.username == adminuser && req.body.password == adminpass){
    req.session.userid=req.body.username;
    console.log(req.session)
    res.render('user')
  }
  else{
    res.send('Invalid username or password');
  }
})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
