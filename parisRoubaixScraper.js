var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var races = [];

var countriesRaw = [];
var countries = [];

function getCountries() {
	
	var countriesRaw = fs.readFileSync('countries.txt').toString();
	
	countriesRaw = countriesRaw.split('\n');
	
	for (i in countriesRaw) { // create country objects
		var country = {};
		country.name = countriesRaw[i].split(';')[0];
		country.abbr = countriesRaw[i].split(';')[1];
		countries.push(country);
	}
} // end getCountries


// function input() {
	
//     for (var i=1896; i<2015; i++) { 
//         //loops not working, probably async.
// 		console.log('loop: '+i);
// 		//skip WWI (no races)
// 		// if (i=1915) { i+=4; }
// 		//skip WWII (no races)
// 		// if (i=1940) { i+=3; }
		
// 		var year = i;
// 		var url = 'http://www.procyclingstats.com/race/Paris_Roubaix_'+year+'.html';
		
// 		getBikes(url);
		
//     }
    
// }

function getBikes(url) {
	
		// var $ = cheerio.load(fs.readFileSync(url+year));

		request(url, function(err, resp, body) {  
        	if (err) { throw err; } 
        	var $ = cheerio.load(body);
        	
			var distance = $('.entryHeader h2 span.red').html().replace(/[()]/g, '');
			
			$('div.result').find('div.line').each(function(j, elem){
			
				var Result = {};
				
				Result.lastName = $(elem).find('a.rider').html().split('</span>')[0].replace(/(<([^>]+)>)/ig,'');
				Result.firstName = $(elem).find('a.rider').html().split('</span>')[1].replace(/(<([^>]+)>)/ig,'');
				Result.country = $(elem).find('span.show').next().html().split('flags ')[1].split('"')[0].toUpperCase();
				Result.team = $(elem).find('span.show').eq(2).text();
				Result.time = $(elem).find('span.show').eq(4).text().split(' ')[0];
				Result.rank = j;
				
				Result.year = year;
				Result.distance = distance;
		
				races.push(Result);
			
			}); //end .each
		
		});
	
	// }

	//calculate actual times
	//calculate speed
}

getCountries();
input();

	fs.writeFile('races.txt', JSON.stringify(races), function(err) {
        if (err) {throw err;}
        console.log("done");
    });


// console.log(races);
