var gmargin = {  top: 20,  right: 0,  bottom: 5,  left: 0 };

//finishers bar chart
var widthB = 1100 - gmargin.left - gmargin.right,
    heightB = 600 - gmargin.top - gmargin.bottom;

var xScaleB = d3.scaleLinear()
  .range([0, widthB])
  .domain([1896, 2016]);

var yScaleB = d3.scaleLinear()
  .range([0, heightB])
  .domain([5000, 0]);

var xAxisB = d3.axisBottom()
  .tickFormat(d3.format("d"))
  .tickValues([1896, 2016])
  .scale(xScaleB);

var yAxisB = d3.axisRight()
  .tickValues([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000])
  .scale(yScaleB);

// https://bl.ocks.org/mbostock/3883245
var line = d3.line()
    .x(function(d) { return xScaleB(+d.key); })
    .y(function(d) { return yScaleB(d.value.ptsTot); });

//vars for pos and size consistancy

//animation durations
var dura = 50;

 d3.json('data/top10percent.json', drawChart);

 function drawChart(data) {

    data = d3.entries(data);

    console.log(data);
    // rider detail view

    var detailWidth = 200;

    var riderSelect = d3.select('#theGreatsChart')
        .selectAll('div.greats')
        .data(data)
        .enter()
        .append('div')
        .attrs({
          class: function(d) {
            return d.key+' greats hidden';
          },
        })
        .styles({
          left: function(d) {
            var years = d3.entries(d.value.years);
            var lastYear = years[years.length-1];
            var x = xScaleB(parseFloat(lastYear.key))-detailWidth-100;
            return x+'px';
          },
          top: function(d) {
            var years = d3.entries(d.value.years);
            var lastYear = years[years.length-1];
            var y = yScaleB(parseFloat(lastYear.value.ptsTot))-75;
            return y+'px';
          },
          width: detailWidth+'px',
        });

    riderSelect.append('h3')
        .text( function(d) {
          return d.value.name;
        })

    riderSelect.selectAll('div')
        .data(function(d) {
          return d3.entries(d.value.years);
        })
        .enter()
        .append('div')
        .attrs({
          class: function(d) {
            return d.key+' yearRank darkGray';
          }
        })
        .html( function(d) {
            var rank;
            if (d.value.rank<4) {
              rank = '<img class="medal" src="images/medal-0'+d.value.rank+'.svg" />';
            } else {  rank = '<span class="rank liteGray"> '+d.value.rank+'</span>'; }
            return d.key+rank;
        });

    var chart = d3.select('#theGreatsChart')
        .append('svg')
        .attr('width', widthB)
        .attr('height', heightB);

    var arc = chart.selectAll('g.arc')
        .data(data)
        .enter()
        .append('g')
        .attr('class', function(d) {
            return d.key+' arc';
        })
        .on('mouseover', cyclistOn())
        .on('mouseout', cyclistOff())
        .on('mouseup', cyclistOnClick());

    arc.append('path')
        .datum(function(d) {
            years = d3.entries(d.value.years)
            // console.log(years);
            return years;
        })
        .attr('class', 'line')
        .attr('d', line);

    //year highlight circles
    arc.append('circle')
        .datum(function(d) {
          years = d3.entries(d.value.years);
          return years;
          console.log(years);
        })
        .attrs({
          class: function(d){
            return d.key+' yrCircID';
          }
        });

    var nameDots = arc.append('g')
        .datum(function(d) {
            //only append at point for last year
            var years = d3.entries(d.value.years);
            var lastYear = years[years.length-1];
            var nyp = [d.value.name, lastYear];
            return nyp;
        })
        .attr('transform', function(d) {
            var x = xScaleB(d[1].key);
            var y = yScaleB(d[1].value.ptsTot);
            return 'translate('+x+','+y+')';
        });

    nameDots.append('circle')
        .attrs({
            class: 'terminal black',
            cx : 0,
            cy : 0,
            r : 2,
        });

    var txtM = { left: 6, top: 3 }

    nameDots.append('text')
        // .filter(function(d) { return d.value.ptsTot>1625 })
        .attrs({
            class: function(d) {
                if (d[1].value.ptsTot>1625) {
                  return 'darkText riderName top25';
                } else {
                  return 'darkText riderName hidden'; }
            },
            x: txtM.left,
            y: txtM.top
        })
        .text(function(d) { return d[0]; });

    // RIDER DETAIL VIEW
    // ABS Divs

    // var riderDetail =

    // AXES

    chart.append('g')
        .call(xAxisB)
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+heightB+')');

    chart.append('g')
        .call(yAxisB)
        .attr('class', 'y axis');

 }

 //test for clicked element to check other behaviors
 var clickedB=false;

//toggle clicked status, clear styles
 function greatsClick() {
   if (clickedB) {
     console.log(clickedB)
    clearClick();
    clickedB = false;
   } else { clickedB = true; }
 }


 function cyclistOnClick() {
   return function(d) {
     d3.select('div.'+d.key+'.greats')
       .classed('hidden', false);

    d3.selectAll('g.arc')
      .style('opacity', '.4');

     var group = d3.select(this);
     highlight(group);

   }
 }

// return styles to normal
 function clearClick() {

   d3.selectAll('g.arc')
      .style('opacity', '.8')
      .select('.line')
         .transition()
         .duration(dura)
         .styles({
           'stroke-width': '1px',
           stroke: '#f78056'
         });

   d3.selectAll('div.greats')
      .classed('hidden', true);

 }

 function highlight(selection) {
   selection.style('opacity', 1);

   selection.select('.line')
      .transition()
      .duration(dura)
      .styles({
          'stroke-width': '2px',
          stroke: '#0f0f0f'
      });

    var rName = selection.select('.riderName');
    if (rName.classed('hidden')) {
        rName.classed('hidden', false);
    }
 }

 function cyclistOn() {
     return function(d) {
       if (!clickedB) {
         var group = d3.select(this);
         highlight(group);
       }
     }
 }

 function cyclistOff() {
     return function(d) {

       if (!clickedB) {

         var group = d3.select(this);

         d3.selectAll('g.arc')
            .style('opacity', '.8');

         group.style('opacity', .8);

         group.select('.line')
            .transition()
            .duration(dura)
            .styles({
                'stroke-width': '1px',
                stroke: '#f78056'
            });

        var rName = group.select('.riderName');
        if (!rName.classed('hidden') && !rName.classed('top25')) {
            rName.classed('hidden', true);
        }

      } // clicked boolean

     }
 }
