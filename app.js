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
const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");
const CONSUMER_KEY = "3MVG9uq9ANVdsbAWAMrxNE2SBpuQKe4i3X5c8bRBRjLR_oEP2yJCICdm9S_yDDP_k10RZVvCazlfEXLdP4uXK";           // iss
const USERNAME = "sivakrishnareddy.b.db237faa28@salesforce.com";                // sub
const LOGIN_URL = "https://login.salesforce.com";   // aud
const PRIVATE_KEY_PATH = "./server.key";            // RSA private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: CONSUMER_KEY,
    sub: USERNAME,
    aud: LOGIN_URL,
    scope: "api full",
    exp: now + 180 // max 5 minutes
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

// Exchange JWT for access token
async function getAccessToken() {
  const assertion = generateJWT();

  const params = new URLSearchParams();
  params.append(
    "grant_type",
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  );
  params.append("assertion", assertion);

  const tokenUrl = `${LOGIN_URL}/services/oauth2/token`;
  const response = await axios.post(tokenUrl, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  return response.data;
}

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
  formData.append('grant_type', 'client_credentials');
  formData.append('client_id', consumerId);
  formData.append('client_secret', consumerSecret);
  //formData.append('username', username);
  //formData.append('password', password);
  
  (async () => {

    try {
      const tokenResponse = await getAccessToken();
      console.log("OAuth Token Response:\n", tokenResponse);
      console.log("OAuth Token Response:\n", tokenResponse.access_token);
      app.locals.oauthtoken = tokenResponse.access_token;
      app.locals.lightningEndPointURI = lightningEndPointURI;
      app.locals.appName = appName;
      app.locals.cmpName = cmpName;
      console.log("app.locals.oauthtoken:\n", app.locals.oauthtoken);
      res.redirect('/home');
    } catch (err) {
      if (err.response) {
        console.error("Salesforce Error:", err.response.data);
      } else {
        console.error("Error:", err.message);
      }
    }

    /*

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
    }*/
  })();
  
});

// Run
(async () => {
  try {
    const tokenResponse = await getAccessToken();
    console.log("OAuth Token Response:\n", tokenResponse);
    console.log("OAuth Token Response:\n", tokenResponse.access_token);
    app.locals.oauthtoken = tokenResponse.access_token;
    app.locals.lightningEndPointURI = lightningEndPointURI;
    app.locals.appName = appName;
    app.locals.cmpName = cmpName;
    console.log("app.locals.oauthtoken:\n", app.locals.oauthtoken);
    //res.redirect('/home');
  } catch (err) {
    if (err.response) {
      console.error("Salesforce Error:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
})();


// Served Localhost
console.log('Served: http://localhost:' + port);
app.listen(port);