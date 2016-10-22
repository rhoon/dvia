var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var races = [];

var countriesRaw = [];
var countries = [];

var years = [1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015]

function getCountries() {
	
	var countriesRaw = fs.readFileSync('countries.txt').toString();
	
	countriesRaw = countriesRaw.split('\n');
	
	for (var i in countriesRaw) { // create country objects
		var country = {};
		country.name = countriesRaw[i].split(';')[0];
		country.abbr = countriesRaw[i].split(';')[1];
		countries.push(country);
	}
} // end getCountries


function input() {
	
    for (var item in years) {

        content = fs.readFileSync('race-data/race'+years[item]+'.txt');
        getBikes(content, years[item]);
    }
    
}

function getBikes(body, year) { // this function works, independently

        	var $ = cheerio.load(body);
        	
			var distance = $('.entryHeader h2 span.red').html().replace(/[()]/g, '');
			// console.log('distance: ' + distance);
			
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

}

// getCountries();
input();

// getBikes test
// var content = fs.readFileSync('paris-roubaix-testPage2.html');
// getBikes(content, 1981);

	fs.writeFile('races.json', JSON.stringify(races), function(err) {
        if (err) {throw err;}
        console.log("done");
    });

// console.log(races);
