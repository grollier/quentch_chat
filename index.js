var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');


var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var fs = require('fs');



app.get('/', function(req, res){
  res.sendfile('json.html');
});

app.get('/chat', function(req, res){
  res.sendfile('chatIndex.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected')
  });
  socket.on('chat message', function(msg){
    console.log('message: ' +msg);
    io.emit('chat message', msg);
  });
});

var cwd = process.cwd();
var xmlPathShort = cwd + '/xml';
var xmlPath = xmlPathShort + '/';
var jsonPath = cwd + '/json/';
var gamePath = jsonPath + 'games/'
var weeksPath = gamePath + 'weeks/'


function parseWeeks(game) {
  var filename = game.details.date + '.json'
  var json = fs.writeFile( weeksPath + filename, JSON.stringify(game), 'utf8', function(err){
        if(err){
          return console.log(err);
        }
          console.log('a new function');
    });

}

function parseGame(game){
  var filename = game.details.gamecode + '.json'
  var json = fs.writeFile( gamePath + filename, JSON.stringify(game), 'utf8', function(err){
        if(err){
          return console.log(err);
        }
    });
  console.log(game);
  console.log("The file was saved!!");
  console.log('=====================');
}

function parseSchedule(){
  //console.log(Nodes.toString());
  var xml = fs.readFileSync( xmlPath + 'NFL_SCHEDULE.XML', { encoding: 'UTF-8' });
  var doc = new dom().parseFromString(xml);
  var nodes = xpath.select('//game-schedule', doc);


  var filename = 'NFL_SCHEDULE.json';
  var schedules = [];

  nodes.forEach(function(node){

    var stadiumName = xpath.select1('stadium/@name', node).value;
    var stadiumCity = xpath.select1('stadium/@city', node).value;
    var stadiumState = xpath.select1('stadium/@state', node).value;
    var stadiumCountry = xpath.select1('stadium/@country', node).value;
    var stadiumGlobalId = xpath.select1('stadium/@global-id', node).value;

    var visitingTeamName = xpath.select1('visiting-team/team-name/@name', node).value;
    var visitingTeamAlias = xpath.select1('visiting-team/team-name/@alias', node).value;
    var visitingTeamCity = xpath.select1('visiting-team/team-city/@city', node).value;
    var visitingTeamGlobalId = xpath.select1('visiting-team/team-code/@global-id', node).value;

    var visitingTeamScoreRaw = xpath.select1('visiting-team-score/@score', node);
    if(visitingTeamScoreRaw){
      visitingTeamScore = visitingTeamScoreRaw.value;
    }else{
      visitingTeamScore = '--';
    }



    var homeTeamName = xpath.select1('home-team/team-name/@name', node).value;
    var homeTeamAlias = xpath.select1('home-team/team-name/@alias', node).value;
    var homeTeamCity = xpath.select1('home-team/team-city/@city', node).value;
    var homeTeamGlobalId = xpath.select1('home-team/team-code/@global-id', node).value;

    var homeTeamScoreRaw = xpath.select1('home-team-score/@score', node);
    if(homeTeamScoreRaw){
      homeTeamScore = homeTeamScoreRaw.value;
    }else{
      homeTeamScore = '--';
    }

    var gameGlobalID = xpath.select1("gamecode/@global-id", node).value;
    var detailsYear = xpath.select1("date/@year", node).value;
    var detailsMonth = xpath.select1('date/@month', node).value;
    var detailsDay = xpath.select1('date/@day', node).value;
    var dTotalQuartersRaw = xpath.select1('total-quarters/@total', node);
    if(dTotalQuartersRaw){
      dTotalQuarters = dTotalQuartersRaw.value;
    }else{
      detailsTotalQuarters = "--";
    }
    var dHomeOutcomeRaw = xpath.select1('outcome-home/@outcome', node);
    if(dHomeOutcomeRaw){
      dHomeOutcome = dHomeOutcomeRaw.value;
    }else{
      dHomeOutcome = "--";
    }
    var dVisitOutcomeRaw = xpath.select1('outcome-visit/@outcome', node);
    if(dVisitOutcomeRaw){
      dVisitOutcome = dVisitOutcomeRaw.value;
    }else{
      dVisitOutcome = "--";
    }

    var game.details.dateB = moment(),subtract('', 15);
    var game.dtails.dateA = moment().fromNow();

    var game = {
        "visitor": {
          "name": visitingTeamName,
            "alias": visitingTeamAlias,
            "city": visitingTeamCity,
            "global-id": visitingTeamGlobalId,
            "score": visitingTeamScore,
          },
          "home": {
            "name": homeTeamName,
            "alias": homeTeamAlias,
            "city": homeTeamCity,
            "global-id": homeTeamGlobalId,
            "score": homeTeamScore,
          },
          "stadium": {
            "name": stadiumName,
            "city": stadiumCity,
            "state": stadiumState,
            "country": stadiumCountry,
            "global-id": stadiumGlobalId,
          },
          "details": {
            "gamecode": gameGlobalID,
            "date": {
              "year": detailsYear,
              "month": detailsMonth,
              "day": detailsDay,
            },
            "total-quarters": dTotalQuarters,
            "outcome-home": dHomeOutcome,
            "outcome-visit":dVisitOutcome,
          },
      };


    schedules.push(game);

    console.log('You pushed the file and it went dowfall to its path! D:!!');


    parseGame(game);
    parseWeeks(game);

  });


  var json = fs.writeFile( jsonPath + filename, JSON.stringify(schedules), 'utf8', function(err){
        if(err){
          return console.log(err);
        }
        console.log("The file was saved!!");
    });

}



parseSchedule();

http.listen(5000, function(){
  console.log('listening on *:5000');
});
