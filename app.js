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

strategy.movingAvg(publicClient, 1).then(function(longAvg){
console.log("24 hour",longAvg);
  strategy.movingAvg(publicClient, .5).then(function(shortAvg){
  console.log("12 hour",shortAvg);
  if(shortAvg < longAvg){
    //sell
  }else{
    //buy
  }
  });
})
