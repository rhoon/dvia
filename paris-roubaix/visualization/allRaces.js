var margin = {  top: 20,  right: 10,  bottom: 5,  left: 45 };

//finishers bar chart
var width = 300 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var wSpeed = 860 - margin.left - margin.right;
    hSpeed = 1200 - margin.top - margin.bottom;

var xScale = d3.scaleLinear()
  .range([0, width])
  .domain([0, 250]);

var xScaleSpeeds = d3.scaleLinear()
  .range([0, wSpeed])
  .domain([0, 45]);

var yScale = d3.scaleLinear()
  .range([0, height])
  .domain([1896, 2016]);

var xAxis = d3.axisTop()
  .ticks(9)
  .tickSize(hSpeed)
  .scale(xScaleSpeeds);

// var yAxis = d3.axisRight()
//   .ticks(4)
//   .scale(yScale);

//vars for pos and size consistancy
var barHeight = 6;
var chartLabelY = -20;
//animation durations
var dura = 200;

 d3.json('data/parisRoubaix-fullv3.json', drawChart);

 function drawChart(data) {

    //organize data by year
    data = d3.nest()
        .key( function(d) { return d.year})
        .entries(data);

    //move finishers and starters up the tree
    data.forEach( function(d) {
        d.finishers = d.values[0].finishers;
        d.starters = d.values[0].starters;
    });

    console.log(data);

    //finishers bar chart
    barchart = d3.select('#allRacesChart')
        .append('svg')
        .attr('class', 'bars')
        .attr('width', width)
        .attr('height', height);

    //labels
    barchart.append('text')
        .attrs({
          y: chartLabelY,
          x: 0,
          class: 'liteGray label'
        })
        .text('Year');

    barchart.append('text')
        .attrs({
          y: chartLabelY,
          x: margin.left,
          class: 'liteGray label'
        })
        .text('DNF');

    barchart.append('text')
        .attrs({
          y: chartLabelY,
          x: margin.left+30,
          class: 'red label'
        })
        .text('Finishers');

    //bar groups
    bars = barchart.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d) {
            return 'translate(0,'+yScale(d.key)+')';
        });

    //mouse over effect
    bars.append('rect')
        .attrs({
            x: margin.left,
            y: 0,
            width: width+margin.right,
            height: barHeight,
            class: function(d) { return 'y'+d.key+' darkGray' },
            opacity: 0
        })
        .on('mouseover', raceOn())
        .on('mouseout', raceOff())

    var est;

    //append bars for racers who did not finish (womp womp)
    bars.append('rect')
            .attrs({
                class: 'dnf',
                x: margin.left,
                y: 0,
                height: barHeight,
                width: function(d) { return (+d.starters)-(+d.finishers); }
            })
            .on('mouseover', raceOn())
            .on('mouseout', raceOff());

    //append bars for racers who did finish (stacked)
    bars.append('rect')
            .attrs({
                class: 'finishers',
                x: function(d) {
                    var pos = (+d.starters)-(+d.finishers);
                    if (!isNaN(pos)) { return pos+margin.left; } else { return margin.left; }
                },
                y: 0,
                height: barHeight,
                width: function(d) { return (+d.finishers) }
            })
            .on('mouseover', raceOn())
            .on('mouseout', raceOff());


    bars.append('text')
            .attrs({
                class: 'year',
                x: 0,
                y: barHeight,
            })
            .text( function(d) {
                if (d.key%5==0 || d.key==1896) {
                    return d.key;
                }
            })


    //draw speeds chart
    var speedsChart = d3.select('#allRacesChart')
        .append('svg')
            .attrs({
                class: 'speed',
                width: wSpeed,
                height: hSpeed
            });

    //draw labels
    speedsChart.append('text')
        .attrs({
            x: 0,
            y: chartLabelY,
            class: 'liteGray label'
        })
        .text('Speed (km/hr)');

    speedsChart.append('text')
        .attrs({
            x: wSpeed,
            y: chartLabelY,
            class: 'red label',
            'text-anchor': 'END'
        })
        .text('EACH FINISHING RACER IS MARKED BY A SINGLE RED LINE');

    //groups for finishers
    speedsChart.append('g')
        .call(xAxis)
        .attr('class', 'speeds x axis')
        .attr('opacity', '.5')
        .attr('transform', 'translate(0,'+hSpeed+')');

    //visualize data
    var year = speedsChart.selectAll('g.sYear')
        .data(data)
        .enter()
        .append('g')
        .attr('class', function(d) { return 'sYear y'+d.key })
        .attr('transform', function(d) {
          return 'translate(0,'+yScale(d.key)+')'
        });

    //rollover text showing year, winner, country (if available) and speed
    year.append('text')
        .attrs({
            class: function(d) { return 'y'+d.key+' stats label liteGray hidden' },
            x: 0,
            y: function(d) { if (d.key<1898){ return barHeight+12; } else return -5; },
            opacity: 0
        })
        .text(function(d) {
            var wName = d.values[0].name+', ';
            var wCountry = d.values[0].country+', ';
            var wSpeed = kmhr(d.values[0].kmPerSec)+'km/hr';
            if (d.values[0].country == undefined) { wCountry = '' };
            return d.key + ' Winner : ' + wName + wCountry + wSpeed;
        });

    //rollover highlight
    year.append('rect')
        .attrs({
            x: 0,
            y: 0,
            width: wSpeed,
            height: barHeight,
            class: function(d) { return 'y'+d.key+' darkGray' },
            opacity: 0
        })
        .on('mouseover', raceOn())
        .on('mouseout', raceOff());

    year.selectAll('rect.speeds')
        .data(function(d) {
            return d.values;
        })
        .enter()
        .append('rect')
        .attrs({
            class: 'speeds',
            x: function(d) { return xScaleSpeeds(d.kmPerSec*3600); },
            y: 0,
            height: barHeight,
            width: 1
        });


 }

// give everything the class of d.key and then match classes to select related items
function raceOn() {
    return function(d) {
        d3.selectAll('rect.y'+d.key)
            .transition()
            .duration(dura)
            .attr('opacity', 1);

        d3.select('text.y'+d.key)
            .classed('hidden', false)
            .transition()
            .duration(dura)
            .attr('opacity', 1);

        d3.select('g.y'+d.key).selectAll('rect.speeds')
            .transition()
            .duration(dura)
            .attr('fill', '#f2f2f2');

    }
}

function raceOff() {
    return function(d) {
        d3.selectAll('rect.y'+d.key)
            .transition()
            .duration(dura)
            .attr('opacity', 0);

        d3.select('text.y'+d.key)
            .classed('hidden', true)
            .transition()
            .duration(dura)
            .attr('opacity', 0);

        d3.select('g.y'+d.key).selectAll('rect.speeds')
            .transition()
            .duration(dura)
            .attr('fill', '#f78056');
    }
}

function kmhr(kmsec) {
    return Math.ceil((kmsec)*3600);
}
