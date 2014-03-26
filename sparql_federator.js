var request        = require('request');
var querystring    = require("querystring");
var async          = require("async");
var fs             = require('fs');
var _              = require('underscore');
var Cache 		   = require('./cache');
var Infobox_parser = require('./infobox_parser');

var sparql_federator = function(options) {
	this.cache            = new Cache();
	this.options          = options;
	this.dbpedia_endpoint = "http://dbpedia.org/sparql?";
	this.method           = 'POST';
	this.encoding         = 'utf8';
	this.headers          = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': 'application/json'
	};
};

sparql_federator.prototype.output = function(data) {
	var cache_filename   = __dirname + '/cache/result.json';
	this.cache.setCache(cache_filename, data, function(error, data) {
		if (!error) console.log("Google Knowledge Extractor Completed successfully !!");
	});
}

sparql_federator.prototype.parseDBpediaConcepts = function(json) {

	console.log("Parsing DBpedia Concepts ... ");

	var sparql_federator = this;
	var json 			 = _.isObject(json) ? json : JSON.parse(json);
	var result           = {};

	// For Each DBpedia concept fetch all its instances
	async.each(json.results.bindings,function(item, asyncCallback){
		var concept        = item.c.value;
		var type_label     = decodeURIComponent(concept).replace(/_/g,' ');
		var label          = type_label.substr(type_label.lastIndexOf('/') + 1);

		// get the instances of a certain DBpedia concept
		sparql_federator.getInstances(concept, label, function(error, data){
			if (!error) {
				// if the instances has been fetched properly, parse them
				sparql_federator.parseDBpediaInstance(label,data,function(error,results){
					if (!error) {
						// here we remove the instances array, since we already cache it to reduce file size
						delete results.instances;
						result[label] = results;
						asyncCallback();
					}
				});
			}
		});
	  },function(err){
	  	sparql_federator.output(result);
	  }
	);
}

sparql_federator.prototype.parseDBpediaInstance = function(type,json,conceptsCallback) {

	console.log("Parsing DBpedia Instances for type: "+ type +"... ");

	var sparql_federator = this;
	var cache_filename   = __dirname + '/cache/GKB/' + type + '.json';
	var result           = {"instances" : {}, "summary" : {}, "infoboxless":[]};
	var json 			 = _.isObject(json) ? json : JSON.parse(json);

	sparql_federator.cache.getCache(cache_filename, function(error, data) {
		// There is no cached instance GKB file
		if (!error && !data) {
			async.each(json.results.bindings,function(item, asyncCallback){
			  	var instance 	    = item.Concept.value;
				var instance_label  = decodeURIComponent(instance).replace(/_/g,' ');
				var label           = instance_label.substr(instance_label.lastIndexOf('/') + 1);

				sparql_federator.getKnowledgeBox(label, type, function(error, data){
					if (!error) {
						if (data) {
							result.instances[label] = data;
							instance_proprties      = _.keys(data);
							for(var i = 0, l = instance_proprties.length; i < l ; i++ ) {
								if (_.indexOf(_.keys(result.summary),instance_proprties[i]) == -1 ) {
									result.summary[instance_proprties[i]] = 1;
								} else result.summary[instance_proprties[i]]++;
							}
						} else result.infoboxless.push(label);
					}
					asyncCallback();
				});
			  },function(err){
				sparql_federator.cache.setCache(cache_filename,result,function() {
					if (!error) {
						conceptsCallback(null,result);
					}
				});
			  });
		} else {
			conceptsCallback(null,data);
		}
	});
}

sparql_federator.prototype.getKnowledgeBox = function(instance, type, callback) {
	setTimeout(function() {
		console.log("Getting Google Knowledge Boxes for type for: " + type + " instance: " + instance);
		var infobox_parser  = new Infobox_parser();
	  	infobox_parser.parse(instance, type, function(error, data){
	  		if (!error) callback(null,data);
	  	});
	}, 1500);
};

sparql_federator.prototype.getInstances = function(concept, label, callback) {

	console.log("Getting DBpedia instances for: " + concept + " ... ");

	var sparql_federator = this;
	var cache_filename   = __dirname + '/cache/instances/' + label + '.json';

	sparql_federator.cache.getCache(cache_filename, function(error, data) {
		if (!error && !data) {
			var SPARQL_query     = "select distinct ?Concept where {?Concept a <"+ concept + ">}";
			SPARQL_query        += sparql_federator.options.limit_dbpedia_instances? " LIMIT " + sparql_federator.options.limit_dbpedia_instances_value : "";

			var encoded_query    = sparql_federator.dbpedia_endpoint + querystring.stringify({query: SPARQL_query});
			var options          = { url: encoded_query, method:sparql_federator.method, encoding:sparql_federator.encoding, headers: sparql_federator.headers };

			request(options, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					sparql_federator.cache.setCache(cache_filename, body, function(error, data){
						if (!error) {
							callback(null, body);
						}
					});
				} else console.log("An Error Occurred while executing a query to " + sparql_federator.dbpedia_endpoint + " using query: " + SPARQL_query);
			});
		} else callback(null, data);
	});
};

sparql_federator.prototype.getDBpediaConcepts = function() {

	console.log("Getting DBpedia Concepts ... ");

	var sparql_federator = this;
	var SPARQL_query     = "select distinct ?c where { ?s owl:sameAs ?f. ?s rdf:type ?c. filter (regex (?f, <http://rdf.freebase.com/ns/>)) filter (regex(?c, <http://dbpedia.org/ontology/>)) filter NOT EXISTS {?c rdfs:subClassOf owl:Thing  } }";
	SPARQL_query        += this.options.limit_dbpedia_concepts ? " LIMIT " + this.options.limit_dbpedia_concepts_value : "";
	var encoded_query    = this.dbpedia_endpoint + querystring.stringify({query: SPARQL_query});
	var options          = { url: encoded_query, method:this.method, encoding:this.encoding, headers: this.headers };
	var cache_filename   = __dirname + '/cache/dbpediaConcepts.json';

	sparql_federator.cache.getCache(cache_filename, function(error, data) {
		if (!error) {
			if (!data) {
				// If the data has not been saved yet, make the call, cache it and then continue
				// The query is run for the first time or user wishes to get live results and override cache
				request(options, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						sparql_federator.cache.setCache(cache_filename,body, function() {
							sparql_federator.parseDBpediaConcepts(JSON.parse(body));
						});
					} else console.log("An Error Occurred while executing a query to " + sparql_federator.dbpedia_endpoint + " using query: " + SPARQL_query + " with Error: " + error);
				});
			} else sparql_federator.parseDBpediaConcepts(data);
		}
	});
}

// Export the Parser constructor from this module.
module.exports = sparql_federator;