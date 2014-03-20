var request        = require('request');
var querystring    = require("querystring");
var async          = require("async");
var fs             = require('fs');
var _              = require('underscore');
var Infobox_parser = require('./infobox_parser');

var sparql_federator = function(options,res) {
	this.res = res;
	this.options          = options;
	this.dbpedia_endpoint = "http://dbpedia.org/sparql?";
	this.method           = 'POST';
	this.encoding         = 'utf8';
	this.headers          = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': 'application/json'
	};
};

sparql_federator.prototype.print = function(data) {
	this.res.send(data);	
}

sparql_federator.prototype.parseDBpediaConcepts = function(json) {
	var sparql_federator = this;
	var result           = {};

	async.each(json.results.bindings,
	  function(item, callback){
		sparql_federator.getConceptInstances(item.c.value, function(error, data){
			if (!error) {
				var instance_label = item.c.value;
				var label          = instance_label.substr(instance_label.lastIndexOf('/') + 1);
				result[label]      = data;
			}
			callback();
		});
	  },function(err){
	  	sparql_federator.print(result);
	  }
	);
}

sparql_federator.prototype.getConceptInstances = function(concept, callback) {
	var sparql_federator = this;
	var SPARQL_query     = "select distinct ?Concept where {?Concept a <"+ concept + ">}";
	SPARQL_query        += " LIMIT 100";
	
	var encoded_query    = this.dbpedia_endpoint + querystring.stringify({query: SPARQL_query});
	var options          = { url: encoded_query, method:this.method, encoding:this.encoding, headers: this.headers };

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var result    = {"instances" : {}, "summary" : {}};
			var results   = JSON.parse(body);
			async.each(results.results.bindings,function(item, callback){
					var instance_label  = decodeURIComponent(item.Concept.value).replace(/_/g,' ');
					var label           = instance_label.substr(instance_label.lastIndexOf('/') + 1);
				  	var infobox_parser  = new Infobox_parser();
				  	infobox_parser.parse(label, function(error, data){
				  		if (!error && data) {
							result.instances[label] = data;
							instance_proprties      = _.keys(data);
							for(var i = 0, l = instance_proprties.length; i < l ; i++ ) {
								if (_.indexOf(_.keys(result.summary),instance_proprties[i]) == -1 ) {
									result.summary[instance_proprties[i]] = 1;
								} else result.summary[instance_proprties[i]]++;
							}
				  		}
				  		callback();
				  	}); 				
				},function(err){
				callback(null,result);
			});
		} else console.log("An Error Occured while executing a query to " + sparql_federator.dbpedia_endpoint + " using query: " + SPARQL_query);
	});
};

sparql_federator.prototype.getDBpediaConcepts = function() {
	var sparql_federator = this;
	var SPARQL_query     = "select distinct ?c where { ?s owl:sameAs ?f. ?s rdf:type ?c. filter (regex (?f, <http://rdf.freebase.com/ns/>)) filter (regex(?c, <http://dbpedia.org/ontology/>)) }";
	SPARQL_query        += this.options.limit_dbpedia_instances ? " LIMIT " + this.options.limit_dbpedia_instances_value : "";
	var encoded_query    = this.dbpedia_endpoint + querystring.stringify({query: SPARQL_query});
	var options          = { url: encoded_query, method:this.method, encoding:this.encoding, headers: this.headers };
	var cache_filename   = __dirname + '/cache/dbpediaConcepts.json';

	fs.stat(cache_filename, function(error, stat) { 
		if (error == null && sparql_federator.options.cache_dbpedia_concepts) {
			fs.readFile(cache_filename, 'utf8', function (error, data) {
				if (!error) {
					sparql_federator.parseDBpediaConcepts(JSON.parse(data));
					console.log('File successfully Read from Cache!');
				} else console.log("Error Reading Cache from file: " + cache_filename + " with Error: " + error);
			});
		} else {
		// The query is run for the first time or user wishes to get live results and override cache
		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				fs.writeFile(cache_filename, JSON.stringify(JSON.parse(body), null, 4), function(error){
					if (!error) {
						sparql_federator.parseDBpediaConcepts(JSON.parse(body));
						console.log('File successfully written!');
					} else console.log("Error Writing Cache To file: " + cache_filename + " with Error: " + error);
				});
			} else console.log("An Error Occured while executing a query to " + sparql_federator.dbpedia_endpoint + " using query: " + SPARQL_query + " with Error: " + error);
		});
	}

});
}

// Export the Parser constructor from this module.
module.exports = sparql_federator;