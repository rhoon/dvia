// Race Data Mash compiles PCS' data (which is missing several years of finisher times in
// the 20's and 30's) into the more robust BRI data object

// Adds in starter data

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var d3 = require('d3');

var racesBRI = JSON.parse(fs.readFileSync('races-bri.json'));
var racesPCS = JSON.parse(fs.readFileSync('races-pcs.json'));
var startersBox = {};

var lastRealTime;

// just the race distances by year
var races = [];

fs.readFile("starters.csv", "utf8", function(error, startersIn) { // from http://learnjsdata.com/node.html
    startersIn = d3.csvParse(startersIn);

    // loops through ever year in starters in
    for (var yr in startersIn) {
        //if the number of starters is available, puts that data in startersBox
        if (!isNaN(startersIn[yr].starters)) {
            // per year
            startersBox[startersIn[yr].year] = startersIn[yr].starters;
            // marks 'estimated (est)' property of object 'false'
            startersBox[startersIn[yr].year+'est'] = false;
        } else {
            // estimates the starters based on line of best fit (calculated in R)
            startersBox[startersIn[yr].year] = Math.ceil((1.034*startersIn[yr].year)-1880);
            startersBox[startersIn[yr].year+'est'] = true;
        }
        console.log(startersBox[startersIn[yr].year]);
        console.log(startersBox[startersIn[yr].year+'est']);
    }

    // console.log(startersBox);

    // loops through each racer in racesPCS, gets the year and distance, and pushes it to an array
    for (var racer = 0; racer < racesPCS.length; racer++) {

        var thisYear = parseFloat(racesPCS[racer].year);

        if (thisYear == 1896) {
            var Race = new Object();
            Race.year = parseFloat(racesPCS[racer].year);
            Race.distKm = parseFloat(racesPCS[racer].distance.replace('k',''));
            races.push(Race);
        } else {
            var prev = racer-1;
            var lastYear = parseFloat(racesPCS[prev].year);
        }

        if (thisYear != lastYear) {
            // make a new race
            var Race = new Object();
            Race.year = parseFloat(racesPCS[racer].year);
            Race.distKm = parseFloat(racesPCS[racer].distance.replace('k',''));
            races.push(Race);
        }

    }

    //adding 2016, which isn't in the PCS data
    var Race2016 = new Object();
    Race2016.year = 2016;
    Race2016.distKm = 257.5;
    races.push(Race2016);

    // console.log(races);

    for (var racer in racesBRI) {

        // use next closest time for missing data points, and mark 'est' true
        if (racesBRI[racer].time == undefined || racesBRI[racer].time == 'READ-ERR') {
            racesBRI[racer].time = lastRealTime;
            racesBRI[racer].est = true;
        } else {
            lastRealTime = racesBRI[racer].time;
            racesBRI[racer].est = false;
        }

        // calculate speed -- for some reason this misses some race winners (but not all)
        for (var race in races) {

            if (racesBRI[racer].year == races[race].year) {
                //get & assign race distance
                racesBRI[racer].distKm = races[race].distKm;
                //calculate speed
                racesBRI[racer].kmPerSec = (racesBRI[racer].distKm)/(racesBRI[racer].time);
                break;
            }
        }

        // find the number of known finishers where unknown
        if (racesBRI[racer].finishers == 'NA') {
            rankFix(racesBRI[racer].year); // ERROR on race winners introduced here?
        }

        //set the number of starters
        racesBRI[racer].starters = startersBox[racesBRI[racer].year];
    }

    namesAndCountries();

// console.log(racesBRI);

	fs.writeFile('parisRoubaix-fullv2.json', JSON.stringify(racesBRI), function(err) {
        if (err) {throw err;}
        console.log("done");
    });

}); //end callback to read csv file



    // Names and Countries loops through all of the results and tries to find
    // matching racers with the same names, cleans their names, and assigns countries to them
    // (it misses a few racers without countries)
    function namesAndCountries() {

        for (var racerBRI in racesBRI) {

            // exceptions
            var skip = false;
            var exceptions = ['Louis Gauthier', 'Jo Planckaert', 'Pino Cerami'];
            for (var i in exceptions) {
              skip = (racesBRI[racerBRI].name === exceptions[i]) ? true : false;
              // console.log('exception: '+exceptions[i]);
            }
            if (skip) { break; }

            for (var racerPCS in racesPCS) {
                // check 1
                var fnPCS = racesPCS[racerPCS].firstName.toLowerCase();
                var lnPCS = racesPCS[racerPCS].lastName.toLowerCase();
                // test to see if names are a match
                var hasFirst = racesBRI[racerBRI].name.toLowerCase().includes(fnPCS);
                var hasLast = racesBRI[racerBRI].name.toLowerCase().includes(lnPCS);

                // check 2
                if ( hasFirst && hasLast) {
                    var namesBRI = racesBRI[racerBRI].name.split(' ');
                    var inPCSfn, inPCSln = false;

                    // reverse check name
                    for (var n in namesBRI) {
                      if (fnPCS.includes(namesBRI[n].toLowerCase())) {
                        inPCSfn = true;
                      } else if(lnPCS.includes(namesBRI[n].toLowerCase())) {
                        inPCSln = true;
                      }
                    }

                    // log name
                    if (inPCSfn && inPCSln) {
                      racesBRI[racerBRI].name = racesPCS[racerPCS].firstName +' '+ racesPCS[racerPCS].lastName;
                      racesBRI[racerBRI].country = racesPCS[racerPCS].country;
                    }
                    break;
                }
            }
        }

    } // end names and countries

    // if NA is detected, loop through all racers with this year, find the max rank and assign that to finishers
    function rankFix(year) {

        var maxRank = 0;

        for (var racer in racesBRI) {
            if (racesBRI[racer].year == year) {
                if (racesBRI[racer].rank > maxRank) {
                    maxRank = racesBRI[racer].rank;
                }
            } else if (racesBRI[racer].year > year) {
                break;
            }
        }

        for (racer in racesBRI) {
            if (racesBRI[racer].year == year) {
                racesBRI[racer].finishers = maxRank;
            }
        }

    } //end rankfix
