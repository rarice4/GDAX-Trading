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

function tradeCycle(){
  strategy.tradeDirection(authedClient, publicClient).then(function(direction){
    console.log("Direction", direction);
    marketAction(direction).then(function(action){
      console.log("ACTION",action);
      switch (action) {
        case "buy":
          accounts.buyBTC(authedClient, publicClient).then(function(order){
            newTradeCycle();
          });
          break;
        case "sell":
        accounts.sellBTC(authedClient, publicClient).then(function(order){
          newTradeCycle();
        });
          break;
        case "hold":
          newTradeCycle();
          break;
      }
    })
  });
}


//authedClient.cancelOrder(id, callback);
function marketAction(direction){
  return strategy.movingAvg(publicClient, 1).then(function(longAvg){
  console.log("24 hour",longAvg);
    return strategy.movingAvg(publicClient, .5).then(function(shortAvg){
    console.log("12 hour",shortAvg);
    if(shortAvg < longAvg){
      //if holding btc sell
      if(direction === "USD"){
        return "sell";
      }else{
        //already in usd. hold usd while market continues to fall
        return "hold";
      }
    }else{
      if(direction !== "USD"){
        //buy btc market is rising
        return "buy";
      }else{
        //already holding btc in rising market: hold btc
        return "hold";
      }
    }
    });
  })
}
function newTradeCycle(){
  // start new tradeCycle after 5 minutes
  setTimeout(function(){tradeCycle()},300000);
}
//start first trade cycle
tradeCycle()
