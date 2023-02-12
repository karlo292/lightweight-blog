//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');


const app = express();

mongoose.connect('mongodb+srv://kmongodb1:NPc7G8AsVRfH7Uq@cluster0.xtsiyum.mongodb.net/blogDB', { useNewUrlParser: true });

const postSchema = {
  title: String,
  content: String
}


const Post = mongoose.model('Post', postSchema);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// HOME PAGE

app.get('/', function (req, res) {

  posts = Post.find({}, (error, posts) => {
    if (error) {
      console.error(error);
    } else {
      console.log(posts);
      res.render('home', {
        posts: posts
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

  if(req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::ffff:31.45.230.142'){
    console.log('asdasd')
    res.render('compose')
  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }



})

app.post('/compose', function (req, res) {

  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  })
  post.save(function(err){
    if (!err){
      res.redirect("/");
    }
  });
})

// POSTS PAGE

app.get('/posts/:postId', function (req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){

    res.render("post", {
      title: post.title,
      content: post.content,
      postId: post._id
    });

  });
})

app.post('/posts/:postId/delete', function (req, res){

  console.log('It worked!')

  const requestedPostId = req.params.postId;

  if(req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::ffff:31.45.230.142'){
    Post.findOneAndDelete({_id: requestedPostId}, function(err, post){
      if(err){
        console.log(err)
      } else{
        console.log('Successfully deleted post!')
        console.log('ID: ' + requestedPostId)
        console.log('Title: ' + req.params.title)
      }
      res.redirect('/')


    });
  } else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }


})

app.get('/posts/:postId/edit', function (req,res){
  const requestedPostId = req.params.postId
  if(req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::ffff:31.45.230.142'){
    Post.findOne({_id: requestedPostId}, function(err, post){

      res.render("edit", {
        title: post.title,
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
  if(req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::ffff:31.45.230.142'){
    Post.findOne({_id: requestedPostId}, function (err, post) {
      if (err) {
        console.log(err)
      } else {
        console.log('Found post!')

      }
    })
    res.redirect('/posts/' + requestedPostId + '/edit')
  }else {
    res.send("You can't access this page since you're not an admin, sorry!")
  }


})

app.post('/posts/:postId/edit/done', function (req,res) {
  const requestedPostId = req.params.postId;

  if(req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::ffff:31.45.230.142'){

    let newTitle = req.body.postTitle;
    let newContent = req.body.postBody;

    Post.findOneAndUpdate({_id: requestedPostId}, {title: newTitle, content: newContent}, function(err, post){
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



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
