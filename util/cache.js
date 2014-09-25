var fs    = require('fs');
var _     = require('underscore');
var mkdir = require('mkdirp');
var async = require("async");

var Cache = function(folderName) {

	var cache            = this;
	this.cacheFolderName = folderName + "/cache/";
	this.folder_names    = ["GKB","instances_GKB","instances","instance_properties"];


	// Create the main root cache folder and then create all the subfolders
	mkdir(cache.cacheFolderName, function (err) {
    if (err) console.error(" Couldn't create main cache folder .. please try again !");
   	 else {
   	 	console.log("Main cache folder created or already exitst");

			async.each(cache.folder_names, function(folder, asyncCallback) {
				var folder_name = cache.cacheFolderName + folder;
				mkdir(folder_name, function(err) {
					if (err) console.error(err)
					else {
						console.log('Cache Folder: ' + folder_name + " created or already exitst");
						asyncCallback();
					}
				});
			}, function(err) {
				console.log('All Cache Folders created at destination ...');
			});
   	 }
	});
};

Cache.prototype.getCache = function(filename, callback) {

	var cache_filename = this.cacheFolderName + filename;

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

Cache.prototype.setCache = function(filename, data, cacheCallback) {

	var cache_filename = this.cacheFolderName + filename;
	var json           = _.isObject(data) ? data : JSON.parse(data);

	fs.writeFile(cache_filename, JSON.stringify(json, null, 4), function(error){
		if (!error) {
			console.log('File: '+ cache_filename +' successfully written!');
			cacheCallback(null);
		} else console.log("Error Writing Cache To file: " + cache_filename + " with Error: " + error);
	});
}

// Export the cache constructor from this module.
module.exports = Cache;