var fs = require('fs');
var request = require('request');

var pointsUCI = [500,400,325,275,225,175,150,125,100,85,70,60,50,40,35,30,30,30,30,30,20,20,20,20,20,20,20,20,20,20,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,5,5,5,5,5,3,3,3,3,3];
// ranking points based on: http://www.uci.ch/mm/Document/News/Rulesandregulation/17/73/59/2-ROA-20161108-E_English.PDF Page 60

var races = JSON.parse(fs.readFileSync('parisRoubaix-full.json'));


var allRiders = {};
// to store individual racers

function Rider(fullName) {
    this.years = {};
    this.name = fullName;
}

//year is index of this object, eg 1994: {rank: 1, pts: 500, ptsTot: 1500}
function RankPoints(rank, ptsTot) {
    
    rank = parseInt(rank);
    
    this.rank = rank;
    this.pts = ptsCalc(rank);
    this.ptsTot =  ptsTot + this.pts;
    
}

function ptsCalc(rank) {
    if (rank <= 60) {
        return pointsUCI[rank-1];
    } else {
        return 0;
    }
}

function ptsSuminator(rider) {
    
    var total = 0;
    
    for (var year in rider.years) {
        //////do the stuff
    }
    
}

for ( var cyclist in races) {
    
    var riderName = races[cyclist].name;
    var year = races[cyclist].year;
    var rank = races[cyclist].rank;

    var riderIndex = riderName.toLowerCase().replace(' ', '');
    
    //if this cyclist is not yet in allRiders, add 
    if (allRiders[riderIndex] == undefined) {
        
        allRiders[riderIndex] = new Rider(riderName);
        allRiders[riderIndex].years[year] = new RankPoints(rank, 0);
        console.log('NEW RIDER: ' + riderName);
        console.log(allRiders[riderIndex].years[year]);
    } 
    
}

// loop through race data


// make a new object per racer (hash object)

// two points counters 
// - points for this race
// - cumulative points for paris roubaix