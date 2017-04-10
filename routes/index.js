var express = require('express');
var router = express.Router();
var get_ip = require('ipware')().get_ip;

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/check', function (req, res, next) {
	res.render('check.ejs',{results:[]});
});

router.get('/favicon.ico', function(req, res) {
    res.send(204);
});
module.exports = router;
