var options = require('./options.json');

console.log('Knowledge Scrapper Server Started');

var SPARQL_federator = require('./sparql_federator');
var SF               = new SPARQL_federator(options);

SF.getDBpediaConcepts();
