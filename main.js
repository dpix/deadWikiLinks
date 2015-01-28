var request = require('request');
var cheerio = require('cheerio');
var colors = require('colors');

setInterval(function(req, res){
// The URL we will scrape from - in our example Anchorman 2.

    var url = 'http://www.wikipedia.org/wiki/special:random';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request
        console.log(('searching for broken links at ' + response.request.href).blue)
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            var urls = $('a[href^="http"]').map(function(a, b){return $(b).attr('href')})

            urls.each(function(index, u){
              request(u, function(error, response, html){
                console.log(('checking ' + u).yellow)
                if(error){
                  console.log(('found broken link: ' + u).red)
                }
              })
            })
        }
    })

}, 1000)
