const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`); //
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


//routes
app.get('/', 
(req, res) => {
  //we shouldn't render index.html immediately, first we should check if they already have an existing session
  //If they have a session (check token), send them index, otherwise send them to login. 
  console.log(req.cookies);
  
  res.setHeader('set-cookie', '33242d23');
  res.render('index'); //index.ejs
});

app.get('/create', //'shorten tab'
(req, res) => {
  console.log('req.headers==========', req.headers);
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.get('/login', 
(req, res, next) => {
  res.render('login');
});

app.get('/signup',
(req, res, next) => {
  res.render('signup');
});


app.post('/login',
(req, res, next) => {
  // console.log(Users.get({username: req.body.username})
  models.Users.get({username: req.body.username})
  .error(err => 
      res.sendStatus(401).render('login')
    )
    .then(dbResult => { //from Users.get(), returns the promise object that has the salt, password, and username and id
      var attempted = req.body.password;
      console.log(dbResult); // result from DB
      var isUser = models.Users.compare(attempted, dbResult.password, dbResult.salt);
      if (isUser) {
        models.Sessions.create()        
        .error(err => {
          console.log('Unable to retrieve hash', err, null);
        })
        .then(dbRes => { // dbRes from create() that created a new hash
          models.Sessions.update({id: dbRes.insertId}, {userId: dbResult.id})
          .then(function(res) {
            console.log('res ', res.insertId);
            return res.insertId;
          })
          .then(function(res) {
            models.Sessions.get({id: res})
          .then(function(res) {
            console.log(res);
          });
    
          });
          // console.log('dbres', dbRes);

        });
        
        res.redirect('index');
        
      } else {
        res.sendStatus(401);
      }
      // isUser ? res.redirect('index') : res.sendStatus(401);
    })
    .catch(error => {
      res.sendStatus(401).send(error);
    })
    .catch();
});

app.post('/signup',
(req, res, next) => {
  console.log('response.body------------=====', req.body);
  models.Users.create(req.body); // should add our username object to the database from the signup page
  res.render('index');
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
