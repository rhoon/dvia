// this file combines the existing BikeRaceInfo dataset with the ProCyclingStats dataset

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

//expanding upon this dataset
var racesBRI = JSON.parse(fs.readFileSync('races-bri.json'));
//and pulling race distance and rider countries from this dataset
var racesPCS = JSON.parse(fs.readFileSync('races-pcs.json'));

console.log(racesPCS);