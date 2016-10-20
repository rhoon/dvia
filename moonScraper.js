var fs = require('fs');
var cheerio = require('cheerio');

var moons = [];
var moon = [];

function grabem() {
	
	var $ = cheerio.load(fs.readFileSync('moons-wiki.html'));

	$('tr').each(function(i, elem){
		moon.push($(elem).find('td')
		.eq(10).text()
		.trim()
		)
		});
		
	console.log(moon);
	
}

// function writeText(thing) {
// 	fs.writeFile('moons-data.txt', thing, function(err) {
// 		if (err) throw err;
// 	})
// }

// var file = fs.createWriteStream('moons-data2.txt');

// file.on('error', function(err) { console.log("error") });

// moon.forEach(function(v) { file.write(v.join(', ') + '\n'); });
// file.end();


// grabem();
