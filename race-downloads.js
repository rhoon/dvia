//downloads the files for scraping to avoid making too many server requests

var fs = require('fs');
var request = require('request');
var async = require('async');

var years = [1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015]


function input() {
	
	//loops through array
    async.each(years, function(item, callback) {
    	
		var url = 'http://www.procyclingstats.com/race/Paris_Roubaix_'+item;
		
		request(url, function(err, resp, body) {  
    	    if (err) {throw err;}
    	    // console.log(body);
    	    	fs.writeFile('race-data/race'+item +'.txt', body, function(errWriting) {
        			if (errWriting) {throw errWriting;}
        			console.log("done");
    			});
		});
    });
    
}