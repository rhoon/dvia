var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var winningTime;
var lastTime;

var races = [];

var countriesRaw = [];
var countries = [];

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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

        content = fs.readFileSync('race-data-bri/race'+years[item]+'.txt');
        getBikes(content, years[item]);
        console.log(years[item]);
        
    }
    
}

function toSeconds(timeToParse, rank) {
	console.log('READ RANK - '+ rank);
	
	var totalSecs = 0;
	
	var hasHours = timeToParse.includes('hr');
	var hasMin = timeToParse.includes('min');
	var hasSecs = timeToParse.includes('sec');
	
	if (hasHours) {
		var hours = parseFloat(timeToParse.split('hr')[0]);
		totalSecs += (hours*3600) //conver hours to seconds
	}
	
	if (hasMin) {
		var min = timeToParse.split('min')[0].trim();
		if (hasHours) {
			min = min.split('hr')[1].trim();
		}
		totalSecs += (parseFloat(min)*60);
	}
	
	if (hasSecs) {
		var secs = timeToParse.split('sec')[0].trim();
		if (hasMin) {
			secs = secs.split('min')[1].trim();
		}
		totalSecs += parseFloat(secs);
	}
	
	//////////////// NEEDS TO BE FIXED for s.t. second place case
	if (rank == '1') {
		winningTime = totalSecs;
	} else {
		totalSecs = winningTime + totalSecs;
	}
	
	return totalSecs;
	
}

function getBikes(body, year) { // this function works, independently

        	var $ = cheerio.load(body);
        	
        	var starters = $('div.content').text().split('start')[0];
        	starters = starters.slice(starters.length-4, starters.length-1).trim();
        	
        	var finishers = $('div.content').text().split('finish')[0];
        	finishers = finishers.slice(finishers.length-4, finishers.length-1).trim();
        	if (finishers == 'ied') {
        		finishers = $('div.content').text().split('classified')[0];
        		finishers = finishers.slice(finishers.length-4, finishers.length-1).trim();
        	}
        	
        	if (isNumeric(finishers) == false) { finishers = 'NA'; }
        	if (isNumeric(starters) == false) { starters = 'NA'; }
        	
			//distance
			
			$('div.content').find('li').each(function(j, elem){
				
				var Result = {};
			
				var li = $(elem).text();
				li = li.replace(':', '').replace(',','');
				var hasTeam = li.includes('(');
				var hasTime;
				var sameTime = li.includes('s.t.');
				
				if (li.includes('sec') && sameTime === false) { //1955 13-18
					hasTime = true;
				} else if (li.includes('min') && sameTime === false) {
					hasTime = true;
				} else { hasTime = false; }
				
				if (hasTeam) {
					Result.name = li.split('(')[0].trim();
					Result.team = li.split('(')[1].split(')')[0].trim();
				}
				
				// set times, if they exist
				if (hasTime) {
					var hasAt = li.includes('@');
					var hasCol = li.includes(':');
					if (hasAt===true && hasTeam===true) { 
						Result.time = li.split('@')[1].trim();
						lastTime = Result.time;
					} else if (hasAt) {
						Result.time = li.split('@')[1].trim();
						Result.name = li.split('@')[0].trim();
						lastTime = Result.time;
					} else if (hasTeam) { 
						Result.time = li.split(')')[1].trim();
						lastTime = Result.time;
					} else if (hasCol) {
						Result.name = li.split(':')[0].trim();
						Result.time = li.split(':')[1].trim();
						lastTime = Result.time;
					} else {
						Result.name = li;
						Result.time = 'READ-ERR';
					}
				} else if (sameTime) { // set time for same time, check for no-team exception
					Result.time = lastTime;
					if (hasTeam === false) {
						Result.name = li.split('s.t.')[0].trim();
					}
				} 
				
				if (hasTeam === false && hasTime === false && sameTime === false) {
					Result.name = li.trim();
				} 
				
				Result.name.replace('Ã©', 'é');
				Result.name.replace('Ã¨', 'è');
				
				Result.rank = j+1;
				
				// parse times for math
				if (hasTime && Result.time != 'READ-ERR') {
					Result.time = toSeconds(Result.time, Result.rank);
				} else if (sameTime) {
					// set equal to previous time 
					Result.time = races[(races.length-1)].time;
				}
				
				console.log($(elem).text().trim());
				
				//if not using layered JSON
				Result.finishers = finishers;
        		Result.starters = starters;
        		Result.year = year;
				
				races.push(Result);
			
			}); //end .each


}

// getCountries();
input();


	fs.writeFile('races-bri.json', JSON.stringify(races), function(err) {
        if (err) {throw err;}
        console.log("done");
    });
