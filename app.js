var Gdax = require('gdax');
var access = require('./access.js');
var Promise = require('promise');
var accounts = require('./accounts.js');
var strategy = require('./strategy.js');
console.log("Access:", access);
var publicClient = new Gdax.PublicClient(); // publicClient
var authedClient = new Gdax.AuthenticatedClient(access.key, access.b64secret, access.passphrase); //authedClient
var callback = function(err, response, data) {
  console.log(response.body);
};

// strategy.tradeDirection(authedClient, publicClient).then(function(direction){
//   console.log("Direction", direction);
// });
var today = new Date();
var days = 1;
var params = {
  'end': today.toISOString(),
  'start': new Date(today.getTime() - days*24*60*60*1000).toISOString(),
  'granularity': 3600 //
}
strategy.movingAvg(publicClient, params).then(function(avg){
console.log("24 hour",avg);
var params2 = {
  'end': today.toISOString(),
  'start': new Date(today.getTime() - days*24*60*60*1000*.5).toISOString(),
  'granularity': 1800 //
}
  strategy.movingAvg(publicClient, params2).then(function(avg2){
  console.log("12 hour",avg2);
  });
})
