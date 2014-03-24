var express             = require('express');
var knowledge_extractor = require('./KBE');
var app                 = express();

app.get('/', function(req, res){
	KBE = new knowledge_extractor();
	KBE.start(res);
});

app.listen('8080');
console.log('Knolwedge Scrapper Server Started at localhost:8080');
exports = module.exports = app;
