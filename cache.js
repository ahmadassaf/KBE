var fs = require('fs');
var _  = require('underscore');

var Cache = function() {};

Cache.prototype.getCache = function(cache_filename, callback) {
	fs.exists(cache_filename, function(exists) {
		if (exists) {
			fs.readFile(cache_filename, 'utf8', function (error, data) {
				if (!error) {
					console.log('File: '+ cache_filename +' successfully Read from Cache!');
					_.isObject(data) ? callback(null,data) : callback(null,JSON.parse(data));
				} else console.log("Error Reading Cache from file: " + cache_filename + " with Error: " + error);
			});
		} else callback(null,false);
	});
}

Cache.prototype.setCache = function(cache_filename, data, cacheCallback) {
	var json 			 = _.isObject(data) ? data : JSON.parse(data);
	fs.writeFile(cache_filename, JSON.stringify(json, null, 4), function(error){	
		if (!error) {
			console.log('File: '+ cache_filename +' successfully written!');
			cacheCallback(null);
		} else console.log("Error Writing Cache To file: " + cache_filename + " with Error: " + error);
	});
}

// Export the cache constructor from this module.
module.exports = Cache;