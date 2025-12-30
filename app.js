var nforce = require('nforce');
var express = require('express');
var port = process.env.PORT || 3000;
var FormData = require('form-data');
var fetch = require('cross-fetch');
var cors = require('cors');

var consumerId = process.env.CLIENT_ID;
var consumerSecret = process.env.CLIENT_SECRET;
var authtokenUrl = process.env.CLASSIC_DOMAIN_URI + '/services/oauth2/token';
var lightningEndPointURI = process.env.LIGHTNING_DOMAIN_URI; 
var username = process.env.USERNAME; 
var password = process.env.PASSWORD; 
var appName =  process.env.LightningAppName; 
var cmpName =  process.env.LightningCmpName; 

var app = express();

app.use(cors());

// Require Routes js
var routesHome = require('./routes/home');

// Serve static files
app.use(express.static(__dirname + '/public'));

app.use('/home', routesHome);

app.set('view engine', 'ejs');

/*Allow CORS*/
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
  res.setHeader('Access-Control-Max-Age', '1000');

  next();
});


app.get('/', cors(), function (req, res) {
  const formData = new FormData();
  formData.append('grant_type', 'password');
  formData.append('client_id', consumerId);
  formData.append('client_secret', consumerSecret);
  formData.append('username', username);
  formData.append('password', password);

  (async () => {
    try {
      const res1 = await fetch(authtokenUrl, {
        method: 'POST',
        body: formData
      });

      const user = await res1.json();

      app.locals.oauthtoken = user.access_token;
      app.locals.lightningEndPointURI = lightningEndPointURI;
      app.locals.appName = appName;
      app.locals.cmpName = cmpName;
      res.redirect('/home');
    } catch (err) {
      console.error(err);
    }
  })();
});

// Served Localhost
console.log('Served: http://localhost:' + port);
app.listen(port);