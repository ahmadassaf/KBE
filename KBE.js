var SPARQL_federator = require('./sparql_federator');

var KBE = function() {
	this.options   = {	
		cache_dbpedia_concepts       : true,
		limit_dbpedia_concepts       : false,
		limit_dbpedia_instances      : true,
		limit_dbpedia_concepts_value : 1,
		limit_dbpedia_instances_value: 1
	};
};

KBE.prototype.start = function(res) {
	var sparql_federator = new SPARQL_federator(this.options,res);
	sparql_federator.getDBpediaConcepts();
}

// Export the Parser constructor from this module.
module.exports = KBE;