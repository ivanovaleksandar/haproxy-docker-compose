var express = require('express');

var appName = process.env.APPNAME;
var appHostname = process.env.HOSTNAME;

var app = express();
app.set('port', process.env.APPPORT || 3000);
disable = false

function getClientIP(req){
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

app.get('/on', function (req, res) {
  res.send('Container ' + appHostname + ' | ' + appName + '  is turned ON \n');
  disable = false;
});

app.get('/off', function (req, res) {
  res.send('Container ' + appHostname + ' | ' + appName + '  is turned OFF \n');
  disable = true;
});

app.get('/', function (req, res) {
  if (!disable) {
    res.send('Request sent from client: ' + getClientIP(req) + '\nResponse from container ' + appHostname + ' | ' + appName + ' \n');
  } else {
    res.status(500);
  }
});

app.listen(app.get('port'));

