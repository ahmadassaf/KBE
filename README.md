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

You have to create 4 folders for caching ...
 - main folder called cache in the root of the project
 	+ folder called ```GKB``` inside the cache folder: This will hold the aggregated Google Knowledge boxes extracted for a DBpedia concept (type)
 	+ folder called ```instances_GKB``` inside the cache folder: This will hold the Google Knowledge box for a single instance
 	+ folder called ```instances``` inside the cache folder: This will hold the DBpedia instances for each concept (type)

 - run ```npm server.js```
 - The application is run in the console and the output will be available in results/result.json

## Crawling Configuration
These are the default options that can be found in file ```KBE.js```
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
