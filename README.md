Knowledge-base Extractor
=======================

This is a node.js application that aims at extracting the knowledge represented in the Google infoboxes (aka Google Knowlege Graph Panel). 

The Algorithm implemented is the following:
 - Query DBpedia for all concepts (types) for which there is at least one instance that has a <sameAs> link to a Freebase ID 
 - For each of these concepts pick (n) instances randomly 
 - For each instance, issue a Google Search query:
     + if an infobox is available -> scrap the infobox to extract the properties
     + if no infoxbox is available, check if Google suggests "do you mean ... ?" and if so, traverse the link and look for an infobox
     + if no infobox or correction is available, disambiguate the concept (type) used in the search query and check if an infobox is returned 
     + if Google suggests disambiguation in an infobox parse all the links in it -> it is best to find which suggestion maps to the current data-type we are using -> check the Freebase - DBpedia mappings
 - Cluster properties for each concept 

### Notes
- The result of our expirement is in the results folder ```results/dbpedia.json```
- For a more detailed view for each DBpedia class, one can check the files in ```results/dbpedia```

## How to run?
 - Clone the repo to your local machine
 - run ```npm install``` on the root of the local project directory 
 
We Will automatically create all the required Cache folders:
 
- Main cache folder "cache" in the root folder of the application
    + folder called ```GKB``` inside the cache folder: This will hold the aggregated Google Knowledge boxes extracted for a DBpedia concept (type)
    + folder called ```instances_GKB``` inside the cache folder: This will hold the Google Knowledge box for a single instance
    + folder called ```instances``` inside the cache folder: This will hold the DBpedia instances for each concept (type)
    + folder called ```instance_properties``` inside the cache folder: Thiw ill hold the distinct list of properties for all the instances of a certain concept 

 - run ```node KBE.js``` in the console
 - The application is run in the console and the output will be available in cache/result.json

## Crawling Configuration
There is a set of options that you can change found in the file ```options.json```
```js
cache_dbpedia_concepts       : true,
limit_dbpedia_concepts       : true,
limit_dbpedia_instances      : true,
limit_dbpedia_concepts_value : 10,
limit_dbpedia_instances_value: 10,
proxy                        : null
```
- ```cache_dbpedia_concepts``` cache the concepts retrieved from DBpedia.
- ```limit_dbpedia_concepts``` limit the number of concepts retrieved by DBpedia, false will retrieve all the concepts
- ```limit_dbpedia_instances``` limit the number of instances retrieved for each concept, false will retrieve all the instances
- ```limit_dbpedia_concepts_value``` the number of concepts you wish to retrieve
- ```limit_dbpedia_instances_value``` the number of instances you wish to retrieve for each concept
- ```proxy``` the proxy address string containing ports i.e ```http:\\proxy:8080```

For our experiment the parameters are:
```js
cache_dbpedia_concepts       : true,
limit_dbpedia_concepts       : false,
limit_dbpedia_instances      : true,
limit_dbpedia_concepts_value : null,
limit_dbpedia_instances_value: 100,
proxy                        : null
```

Moreover, you can always check the corresponding CSS class name selectors for the Google Knowledge Panel and edit them if needed in the same ```options.json``` file.

Currently the CSS selectors are:
```
"knowledgeBox"                : "#kno-result",
"knowledgeBox_disambiguate"   : ".kp-blk",
"property"                    : "._Nl",
"property_value"              : ".kno-fv",
"label"                       : ".kno-ecr-pt",
"description"                 : ".kno-rdesc",
"type"                        : "._kx",
"images"                      : ".bicc",
"special_property"            : ".kno-sh",
"special_property_value"      : "._Zh",
"special_property_value_link" : "a._dt"
```
## Updates

 - Properties now have the direct links to DBpedia ontology
 - Properties scores are normalized

## Sample Result
```
  "Band": {
  	"summary": {
  		"label": {
  			"uri": "http://dbpedia.org/property/label",
  			"count": 100
  		},
  		"description": {
  			"uri": "http://purl.org/dc/elements/1.1/description",
  			"count": 100
  		},
  		"type": {
  			"uri": "http://dbpedia.org/property/type",
  			"count": 100
  		},
  		"origin": {
  			"uri": "http://dbpedia.org/property/origin",
  			"count": 88.17204301075269
  		},
  		"members": {
  			"uri": "http://dbpedia.org/property/members",
  			"count": 88.17204301075269
  		},
  		"albums": {
  			"uri": "http://dbpedia.org/property/albums",
  			"count": 87.09677419354838
  		},
  		"leadSingers": {
  			"uri": "http://dbpedia.org/property/leadSingers",
  			"count": 6.451612903225806
  		},
  		"recordLabel": {
  			"uri": "http://dbpedia.org/property/recordLabel",
  			"count": 12.903225806451612
  		},
  		"awards": {
  			"uri": "http://dbpedia.org/property/awards",
  			"count": 13.978494623655912
  		},
  		"nominations": {
  			"uri": "http://dbpedia.org/property/nominations",
  			"count": 7.526881720430108
  		},
  		"born": {
  			"uri": "http://dbpedia.org/property/born",
  			"count": 2.1505376344086025
  		},
  		"nationality": {
  			"uri": "http://dbpedia.org/property/nationality",
  			"count": 2.1505376344086025
  		},
  		"height": {
  			"uri": "http://dbpedia.org/property/height",
  			"count": 1.0752688172043012
  		}
  	},
  	"infoboxless": [
  		"!Action Pact!",
  		"Allele (band)",
  		"Anti-Pasti",
  		"Armageddon (A&M band)",
  		"Banket (band)",
  		"Battlelore",
  		"Ben Folds Five"
  	],
  	"Unmapped_Properties": {
  		"leadSinger": 1,
  		"recordLabels": 1,
  		"songs": 1,
  		"upcomingEvents": 1,
  		"peopleAlsoSearchFor": 1,
  		"activeFrom": 1,
  		"filmMusicCredits": 1,
  		"activeUntil": 1,
  		"moviesAndTvShows": 1
  	}
  }
 ```
