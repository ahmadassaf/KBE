var request = require('request');
var cheerio = require('cheerio');

var infobox_parser = function() {
	this.url            = 'http://www.google.com/search?q=';
	this.userAgent      = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
	this.knowledgePanel = {
		knowledgeBox  				: '#kno-result',
		knowledgeBox_disambiguate	: '.kp-blk',
		property                    : '._om',
		property_value              : '.kno-fv',
		label                       : '.kno-ecr-pt',
		description                 : '.kno-rdesc',
		type                        : '._Qs',
		images                      : '.bicc',
		special_property            : '.kno-sh',
		special_property_value      : '._Zh',
		special_property_value_link : 'a._dt'
	};
};

infobox_parser.prototype.parse = function(instance, type, callback) {
	var infobox_parser = this; 
	var parsed_infobox = undefined;
	var knowledgePanel = this.knowledgePanel;
	var addToObj       =	function(obj, values, properties) {
		// This function maps two arrays together, checks if there are multiple proprties and create an array if needed
		for (var i = 0; i < properties.length; i++) {
			if (values[i]) obj[properties[i]] = /([0-9]{1,2},) ([0-9]{4})/.test(values[i]) ? values[i] : values[i].split(',');}
		};
		// Create the request ot Google, mimicking a user-Agent in order to get the InfoBox back
		request({ url : this.url + instance, headers : { "User-Agent" : this.userAgent }},function(error, response, body){
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
						addToObj(parsed_infobox, values, properties);

						/* Parse Special Proprties Box */
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
						callback(null,parsed_infobox);
					} else if ($(knowledgePanel.knowledgeBox_disambiguate).length > 0 ) infobox_parser.parse(instance + ' ' + type.substr(type.lastIndexOf('/') + 1),null,callback);
						else {
						parsed_infobox = false;
						callback(null,parsed_infobox);
					}
				}
			}
		});
};

// Export the Parser constructor from this module.
module.exports = infobox_parser;