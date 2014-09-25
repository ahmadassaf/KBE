import json
import rdflib
import glob
import urllib
from rdflib import Namespace, Literal, URIRef
from rdflib.graph import Graph, ConjunctiveGraph
from rdflib.plugins.memory import IOMemory

# base uris
baseuri  = "http://data.eurecom.fr/id/fresnel/"
groupuri = "http://data.eurecom.fr/id/fresnel/group/"

# open the json file
f    = open('results/dbpedia.json')
data = json.load(f)
f.close()

# namespaces definition
FOAF         = Namespace("http://xmlns.com/foaf/0.1/")
RDF          = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
RDFS         = Namespace("http://www.w3.org/2000/01/rdf-schema#")
OWL          = Namespace("http://www.w3.org/2002/07/owl#")
DCT          = Namespace("http://purl.org/dc/terms/")
XSD          = Namespace("http://www.w3.org/2001/XMLSchema#")
FRESNEL      = Namespace("http://www.w3.org/2004/09/fresnel#")
DBPEDIAOWL   = rdflib.Namespace("http://dbpedia.org/ontology/")
PROV         = Namespace("http://www.w3.org/ns/prov#")
EIP          = Namespace("http://data.eurecom.fr/def/eip#")
GOO_RESOURCE = rdflib.Namespace("http://data.eurecom.fr/gp/")

# Graph prepation
gResults = rdflib.ConjunctiveGraph()

# ----- converting-----
for summary in data:
	for cat in data.keys():
		category = cat
		uri = baseuri + category.lower()+ "GKPDefaultLens" # creating uris
		# uris creation
		curi = URIRef(uri) # cool uri
		guri = groupuri + category.lower() + "Group"
		guri = URIRef(guri)
		# graph creation
		gResults.add((curi, RDF["type"], FRESNEL["Lens"]))
		gResults.add((curi, FRESNEL["purpose"], FRESNEL["defaultLens"]))
		gResults.add((curi, FRESNEL["classLensDomain"], DBPEDIAOWL[category])) #adding the categories
		gResults.add((curi, FRESNEL["group"], guri))
		gResults.add((curi, PROV["wasDerivedFrom"], URIRef("http://www.google.com/insidesearch/features/search/knowledge.html")))
		partd ="("
		partf = ")"
		space = " "
		summ =data[category]["summary"] # taking the summary elements
		#infoless = data[category]["infoboxless"]
		for prop in summ.keys(): #looping through the properties
			proplower = prop.lower()
			if space in proplower:
				st = proplower.strip(). split(space)
				propstr = "".join(t for t in st)
				# print propstr
			gResults.add((curi, FRESNEL["showProperties"], EIP[propstr] ))

# ----- OUTPUT FILE -----

print "Length of gResults : " + str(len(gResults))
print "Nb of lens : " + str(len(list(gResults.triples((None, RDF["type"], FRESNEL["Lens"])))))

outfile = open("results.n3", "w")
outfile.write(gResults.serialize(format='n3'))
outfile.close()
