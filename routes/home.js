var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	    res.render('pages/home', {
	        oauthtoken: req.app.locals.oauthtoken,
			ouathLightningURL: req.app.locals.lightningEndPointURI,
			appName: req.app.locals.appName,
			cmpName: req.app.locals.cmpName
    });
});

module.exports = router;