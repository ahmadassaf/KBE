var SPARQL_federator = require('./sparql_federator');

var KBE = function() {
	this.options   = {	
		cache_dbpedia_concepts       : true,
		limit_dbpedia_concepts       : false,
		limit_dbpedia_instances      : true,
		limit_dbpedia_concepts_value : null,
		limit_dbpedia_instances_value: 100
	};
};

KBE.prototype.start = function() {
	var sparql_federator = new SPARQL_federator(this.options);
	sparql_federator.getDBpediaConcepts();
}

// Export the Parser constructor from this module.
module.exports = KBE;