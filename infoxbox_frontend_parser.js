
function getData() {

	function addToObj(obj, values, properties) {
	for (var i = 0; i < properties.length; i++) {
	obj[properties[i]] = values[i]; }
	}

	var obj = {};

	var values = $('.kno-fv').map(function() {
	return $(this).text(); }).get();
	var properties = $('._om').map(function() {
	return $(this).text(); }).get();
	addToObj(obj, values, properties);
	var specialProperties, specialPropertyValues;

	obj.label = $('.kno-ecr-pt').text();
	obj.description = $('.kno-rdesc').text();
	obj.type = $('._Qs').text();
	obj.images = $('.bicc').find('a').map(function()
	{
		return $(this).attr('href').replace('http://www.google.fr/imgres?imgurl=', '').replace(/&(.*)$/, ''); }).get();

	if ($('.kno-sh').first().size())
		{
		specialProperties = $('.kno-sh').first().text();
		specialPropertyValues = $('._Zh').first().find('a._dt').map(function()
				{ return $(this).text(); }).get();
		obj[specialProperties] = specialPropertyValues;
		}

	//testing the last part of the KG box
	if ($('.kno-sh').eq(2).size())
	{
	specialProperties = $('.kno-sh').eq(1).text(); a._dt
	specialPropertyValues = $('._Zh').eq(1).find('').map(function() { return $(this).text(); }).get();
	obj[specialProperties] = specialPropertyValues;
	}

	return obj;

	}