// this file combines the existing BikeRaceInfo dataset with the ProCyclingStats dataset

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

//expanding upon this dataset
var racesBRI = JSON.parse(fs.readFileSync('races-bri.json'));
//and pulling race distance (and if possible, rider countries) from this dataset
var racesPCS = JSON.parse(fs.readFileSync('races-pcs.json'));

// just the race distances by year
var races = [];

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

// console.log(races);

for (var racer in racesBRI) {
    
    if (racesBRI[racer].finishers == 'NA') {
        rankFix(racesBRI[racer].year);
    }

    for (var race in races) {
        
        if (racesBRI[racer].year == races[race].year) {
            //get & assign race distance
            racesBRI[racer].distKm = races[race].distKm;
            //calculate speed
            racesBRI[racer].kmPerSec = (racesBRI[racer].distKm)/(racesBRI[racer].time);
            break;
        }
    }

}

// if NA is detected, loop through all racers with this year, find the max rank and assign that to finishers
function rankFix(year) {
    
    var maxRank = 0;
    
    for (racer in racesBRI) {
        if (racesBRI[racer].year == year) {
            if (racesBRI[racer].rank > maxRank) {
                maxRank = racesBRI[racer].rank;
            }
        } else if (racesBRI[racer].year > year) {
            console.log(maxRank)
            console.log(racesBRI[racer].year);
            break;
        }
    }
    
    for (racer in racesBRI) {
        if (racesBRI[racer].year == year) {
            racesBRI[racer].finishers = maxRank;
        }
    }
    
}

// console.log(racesBRI);


	fs.writeFile('parisRoubaix-comprehensive.json', JSON.stringify(racesBRI), function(err) {
        if (err) {throw err;}
        console.log("done");
    });

