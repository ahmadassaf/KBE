Knowledge-base Extractor
=======================

This is a node.js application that aims at extracting the knowledge represented in the Google infoboxes. 

The Algorithm used is the following:
 - Query DBpedia for all concepts (types) that are also linked to Freebase IDs via <sameAs> links 
 - For each of these concepts pick (n) instances randomly 
 - For each instance, issue a Google Search query:
     + if an infobox is available -> scrap the infobox to extract the properties
     + if no infoxbox is available, check if Google suggests do you mean ... ? and if so, traverse the link and look for an infobox
     + if no infobox or correction is available, augment the concept (type) to the search query and check if you will get an infobox 
     + if Google suggests disambiguation in an infobox parse all the links in it -> its best to find which suggestion maps to the current data-type we are using -> check the Freebase - DBpedia mappings
 - Cluster properties for each concept 
