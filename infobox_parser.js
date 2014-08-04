var request = require('request');
var cheerio = require('cheerio');
var Cache   = require('./cache');

var infobox_parser = function(proxy) {
	this.cache          = new Cache();
	this.proxy          = proxy;
	this.url            = 'http://www.google.com/search?q=';
	this.userAgent      = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
	this.knowledgePanel = {
		knowledgeBox  				: '#kno-result',
		knowledgeBox_disambiguate	: '.kp-blk',
		property                    : '._Nl',
		property_value              : '.kno-fv',
		label                       : '.kno-ecr-pt',
		description                 : '.kno-rdesc',
		type                        : '._kx',
		images                      : '.bicc',
		special_property            : '.kno-sh',
		special_property_value      : '._Zh',
		special_property_value_link : 'a._dt'
	};
};

infobox_parser.prototype.parse = function(instance, type, callback) {

	console.log("Getting Google knowledgeBox for " + instance + " ... ");

	var infobox_parser = this;
	var cache_filename = __dirname + '/cache/instances_GKB/'+ instance.replace(/[^a-zA-Z0-9]/g,'_') +'.json';

	this.cache.getCache(cache_filename, function(error, data) {
		if (!error && !data)
			infobox_parser.query(instance, type,cache_filename,function(error, data){
				callback(null,data);
			});
		else if (!error) callback(null,data);
	});
};

infobox_parser.prototype.query = function(instance, type,cache_filename,callback) {

	var infobox_parser = this;
	var parsed_infobox = undefined;
	var knowledgePanel = this.knowledgePanel;
	var addToObj       =	function(obj, values, properties,mergeCallback) {
		// This function maps two arrays together, checks if there are multiple proprties and create an array if needed
		for (var i = 0; i < properties.length; i++) {
			if (values[i]) obj[properties[i]] = /([0-9]{1,2},) ([0-9]{4})/.test(values[i]) ? values[i] : values[i].split(',');
		}
		mergeCallback(null,obj);
	};

	// Create the request ot Google, mimicking a user-Agent in order to get the InfoBox back
	request({ proxy: this.proxy, url : this.url + encodeURIComponent(instance), headers : { "User-Agent" : this.userAgent }},function(error, response, body){
		if (parsed_infobox == undefined) {
			if(!error && response.statusCode == 200 ){
				var $          = cheerio.load(body);
				parsed_infobox = {};
				if ($(knowledgePanel.knowledgeBox).length > 0) {
					parsed_infobox.label       = $(knowledgePanel.label).text().replace(/:/g,'');
					parsed_infobox.description = $(knowledgePanel.description).text().replace(/:/g,'');
					parsed_infobox.type        = $(knowledgePanel.type).text().replace(/:/g,'');

					var properties             = $(knowledgePanel.property).map(function() { return $(this).text().replace(/:/g,''); });
					var values                 = $(knowledgePanel.property_value).map(function() { return $(this).text().replace(/:/g,''); });
					addToObj(parsed_infobox, values, properties, function(error,data) {
						if (!error) {
							parsed_infobox = data;
							/* Parse Special Properties Box */
							if ($(knowledgePanel.special_property).first().length) {
								var specialPropertyValues         = [];
								specialProperties                 = $(knowledgePanel.special_property).first().text();
								$(knowledgePanel.special_property_value).first().find(knowledgePanel.special_property_value_link).each(function(){ specialPropertyValues.push($(this).text()); });
								parsed_infobox[specialProperties] = specialPropertyValues;
							}

							if ($(knowledgePanel.special_property).eq(2).length){
								var specialPropertyValues         = [];
								specialProperties                 = $(knowledgePanel.special_property).eq(1).text();
								$(knowledgePanel.special_property_value).eq(1).find('').each(function() { specialPropertyValues.push($(this).text()); });
								parsed_infobox[specialProperties] = specialPropertyValues;
							}
							infobox_parser.cache.setCache(cache_filename,parsed_infobox, function(error, data) {
								if (!error) callback(null,parsed_infobox);
							});
						}
					});
					// Check if an disambiguation infobox is found and issue a recursive call
				} else if ($(knowledgePanel.knowledgeBox_disambiguate).length > 0 && type ) infobox_parser.parse(instance + ' ' + type.substr(type.lastIndexOf('/') + 1),null,callback);
					// No infobox or disambiguation infobox has been found for this instance
					else callback(null,false);
			} else {
				console.log("Apparently Google blocked Me ...");
				process.exit();
			}
		}
	});
}

// Export the Parser constructor from this module.
module.exports = infobox_parser;