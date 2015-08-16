var express = require('express');
var router = express.Router();

module.exports = router;
module.exports.index = function(req,res) {
  res.render('layout');
};
