var fs = require('fs');
var request = require('request');

var pointsUCI = [500,400,325,275,225,175,150,125,100,85,70,60,50,40,35,30,30,30,30,30,20,20,20,20,20,20,20,20,20,20,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,5,5,5,5,5,3,3,3,3,3];
// ranking points based on: http://www.uci.ch/mm/Document/News/Rulesandregulation/17/73/59/2-ROA-20161108-E_English.PDF Page 60

var races = JSON.parse(fs.readFileSync('parisRoubaix-fullv2.json'));

var allRiders = {};

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

for ( var cyclist in races) {
    
    var riderName = races[cyclist].name;
    var year = races[cyclist].year;
    var rank = races[cyclist].rank;
    
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
            newResults.ptsTot = ptsSuminator(allRiders[riderIndex]) + newResults.pts;
            
    }
    
}

// console.log(allRiders);

	fs.writeFile('byRider.json', JSON.stringify(allRiders), function(err) {
        if (err) {throw err;}
        console.log("done");
    });
