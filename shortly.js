var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var Promise = require('bluebird');

var app = express();

bcrypt = Promise.promisifyAll(bcrypt);

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.cookieParser('This is a super duper secret thing'));
  app.use(express.cookieSession());
  app.use(express.static(__dirname + '/public'));
});

var checkUser = function(req, res, next) {
  if (req.session){
    if(req.session.loggedIn) return next();
  }
  res.redirect('/login');
}

app.get('/', checkUser, function(req, res) {
  console.log("Origin:", req.headers.origin);
  res.render('index');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/logout', function(req, res) {
  req.session.loggedIn = false;
  req.session.user = null;
  req.session.uid = null;
  res.redirect('/login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/create', function(req, res) {
  res.render('index');
});

app.get('/links', checkUser, function(req, res) {
  Links
    .reset()
    .query()
    .where('user_id', '=', req.session.uid)
    //.fetch()
    .then(function(links) {
      console.log("FETCHED LINKS ARE:", links);
      res.send(200, links);
    });
});

app.post('/signup', function(req, res) {
  if (req.body.password !== req.body.confirm){
    return res.send(402, 'Your passwords don\'t match bro');
  }
  User.forge({username: req.body.username}).fetch().then(function(found){
    if(found) {
      return res.send(402, "Pick new username bro");
    }
    User.forge({username: req.body.username, password: req.body.password}).save().then(function(user){
      req.session.loggedIn = true;
      req.session.user = user;
      res.redirect('/');
    });
  })
});

app.post('/login', function(req, res) {
  var uid;
  User.forge({username: req.body.username}).fetch()
  .then(function(row){
    uid = row.attributes.id;
    return bcrypt.compareAsync(req.body.password, row.attributes.password);
  })
  .then(function(match){
    if(match) {
      req.session.loggedIn = true;
      req.session.user = req.body.username;
      req.session.uid = uid;
      if (req.body.json){
        res.send({success: true, username: req.body.username});
      } else {
        res.redirect('/');
      }
    } else {
      if (req.body.json){
        res.send({success: false});
      } else {
        res.status(401).redirect('/login');
      }
    }
  })
  .catch(function(err){
    console.log(err);
    res.redirect('/login');
  });
});

app.post('/links', checkUser, function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.forge({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          user_id: req.session.uid
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          console.log(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:id', function(req, res) {
  new Link({ code: req.params.id }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save()
        .then(function() {
          return db.knex('urls')
            .where('code', '=', link.get('code'))
            .update({
              visits: link.get('visits') + 1,
            });
        })
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
});

app.get('/*', function(req, res){
  res.redirect('/');
});

console.log('Shortly is listening on 4568');
app.listen(3000);
