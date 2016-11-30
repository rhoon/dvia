var fs = require('fs');
var request = require('request');
var d3 = require('d3');
var async = require('async');

var pointsUCI = [500,400,325,275,225,175,150,125,100,85,70,60,50,40,35,30,30,30,30,30,20,20,20,20,20,20,20,20,20,20,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,5,5,5,5,5,3,3,3,3,3];
// ranking points based on: http://www.uci.ch/mm/Document/News/Rulesandregulation/17/73/59/2-ROA-20161108-E_English.PDF Page 60

var races = JSON.parse(fs.readFileSync('parisRoubaix-fullv2.json'));

// all riders has every racer ever to race in Paris Roubaix
var allRiders = {};
// cutoff1 has every racer ever to rank top 60 or higher (score more than 0)
var cutoff1 = {};
// cutoff2 is the top 10%
var cutoff2 = {};
// cutoff3 are the top 10 riders
var cutoff3 = {};

var avg;

//use the pointsUCI array to find the points scored
function ptsCalc(rank) {
    if (rank <= 60) {
        return pointsUCI[rank-1];
    } else {
        return 0;
    }
}

//loops through rider to calc cumulative points
function ptsSuminator(rider) {
    
    var total = 0;
    for (var year in rider.years) {
        total += parseFloat(rider.years[year].pts);
    }
    return total;
    
}

async.each(races, function(cyclist, callback) {
        
    var riderName = cyclist.name; 
    var year = cyclist.year;
    var rank = cyclist.rank;
    
    //set an index in lower case with all spaces removed
    var riderIndex = riderName.toLowerCase().replace(/\s/g, '');
    
    //if this cyclist is not yet in allRiders, add
    if (allRiders[riderIndex] == undefined) {
        // give the rider a years box and proper name value
        allRiders[riderIndex] = new Object();
            allRiders[riderIndex].years = {};
            allRiders[riderIndex].name = riderName;
        
        // add this races's results
        allRiders[riderIndex].years[year] = new Object();
        var newResults = allRiders[riderIndex].years[year];
            newResults.rank = rank;
            newResults.pts = ptsCalc(rank);
            newResults.ptsTot = ptsCalc(rank);
            
    } else {
        
        allRiders[riderIndex].years[year] = new Object();
        var newResults = allRiders[riderIndex].years[year];
            newResults.rank = rank;
            newResults.pts = ptsCalc(rank);
            newResults.ptsTot = ptsSuminator(allRiders[riderIndex]); // + newResults.pts
            
    }
        
}, function(err) {
    console.log(err);
});

// for ( var cyclist in races) {
    
// }

getStats();
cutoffs();

function getTotalPoints(rider) {
    
    // make years into array
    var years = d3.entries(rider.years);
    // get the cumulative total (held in the last year of each)
    var lastYearRaced = years.length-1;
    var ptsTot = years[lastYearRaced].value.ptsTot;
    
    return ptsTot;
}

//calc mean avg
function avgPts() {
    
    var allRidersTot = 0;
    var allPtsTot = 0;
    
    for (var rider in allRiders) {
        allPtsTot += getTotalPoints(allRiders[rider]);
        allRidersTot++;
    }
    
    var avg = allPtsTot/allRidersTot;
    
    return [avg, allRidersTot];
    
}

function getStats() {
    
    var sum = 0;
    
    var avg = avgPts()[0];
    var allRidersTot = avgPts()[1];
    var maxPts = 0;
    var maxPtsRider;
    
    console.log('Mean UCI points per Rider: '+avg);
    
    for (var rider in allRiders) {
        var ptsTot = getTotalPoints(allRiders[rider]);
        sum += Math.pow((ptsTot-avg), 2);
        
        if (ptsTot > maxPts) { 
            maxPts = ptsTot;
            maxPtsRider = allRiders[rider].name;
        }
        
    }
    
    var stdDev = Math.sqrt(sum/allRidersTot);
    
    console.log('Standard Deviation UCI points: '+stdDev);
    console.log('Most Points Scored: '+maxPts+' '+maxPtsRider);
    
}

function cutoffs() {
    
    var allRidersTot = 0;
    var cutoff1Tot = 0;
    var cutoff2Tot = 0;
    var cutoff3Tot = 0;
    
    for (var rider in allRiders) {
        
        allRidersTot++;
        
        var ptsTot = getTotalPoints(allRiders[rider]);
        
        //got any points
        if (ptsTot > 0) {
            cutoff1Tot++;
            cutoff1[rider] = allRiders[rider];
        }
        //top 10%
        if (ptsTot > 275) {
            cutoff2Tot++;
            cutoff2[rider] = allRiders[rider];
        }
        //top 25 riders
        if (ptsTot > 1625) {
            cutoff3Tot++;
            cutoff3[rider] = allRiders[rider];
        }
    }
    
    console.log('CUTOFFS');
    console.log('Total riders ranked: '+allRidersTot);
    console.log('Total riders scoring any points: '+cutoff1Tot);
    console.log('Riders scoring 275 points (Top 10%): '+cutoff2Tot);   
    console.log('Top ' +cutoff3Tot+ ' Riders:'); 
    for (rider in cutoff3) {
        console.log(cutoff3[rider]);
    }
}
// console.log(allRiders);

	fs.writeFile('byRider.json', JSON.stringify(allRiders), function(err) {
        if (err) {throw err;}
        console.log("byRider written");
    });
    
    fs.writeFile('top10percent.json', JSON.stringify(cutoff2),function(err) {
        if (err) {throw err;}
        console.log("cutoff2 written");
    });
