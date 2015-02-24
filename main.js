var request = require('request'); //http
var cheerio = require('cheerio'); //jquery
var colors = require('colors');   //colored console
var Twit = require('twit');       //twitter api
var argv = require('yargs').argv; //command line args
var config = require('./config.twitconfig')

var bot = new Twit(config)
var post = argv.p || false;
var url = argv._[0] || 'http://www.wikipedia.org/wiki/special:random';

var urlsToCheck = [];

var requestPage = function(url){
  //throttling
  if(urlsToCheck.length > 100000){
    return;// dont drown yourself
  }

  var options = {
    url: url,
    headers: {
      'User-Agent': '@BrokenWikiLinks'
    }
  };
  request(options, function(error, response, html){
    try{
      var wikiPageUrl = response.request.href
    }
    catch(e){
      console.log(('occasionally this errors... :S' + e).purple)
      return;
    }
    console.log(('searching for broken links at ' + wikiPageUrl).blue)
    if(!error){
      var $ = cheerio.load(html);
      // find all external links on the page
      var urls = $('#content').find('a[href^="http"]')
      .map(function(a, b){return $(b).attr('href')})
      .filter(function(a, b){return b.indexOf('wikipedia') < 0})

      // map over each one
      urls.each(function(index, u){
        console.log(('checking ' + u).yellow)
        urlsToCheck.push({url: u, page: wikiPageUrl})
      })
    }
  })
}

var requestLink = function(u, wikiPageUrl){
  var options = {
    url: u,
    headers: {
      'User-Agent': '@BrokenWikiLinks'
    }
  };
  request.head(options,function(error, response){
    // if it errors (4xx / 5xx) then report!
    if(error && (!response || response.statusCode >= 400)){
      console.log(('found broken link: ' + u + ', error: ' + error).red)

      console.log('posting to Twitter')
      if(post){
        bot.post('statuses/update', { status: 'Page: ' + wikiPageUrl + ', broken link: ' + u }, function(){
          //do something??

          console.log('succesfully posted to twitter')
        });
      }
    }

    setImmediate(checkUrls)
  });
}

var checkUrls = function(){
  if(urlsToCheck.length){
    var meh = urlsToCheck.pop()
    requestLink(meh.url, meh.page)
  }

  else{
    setTimeout(checkUrls)
  }
}

requestPage(url)

if(!argv._.length){
  setInterval(function(){
    requestPage(url)
  }, argv.t || 20 * 1000)
}

setTimeout(checkUrls)
