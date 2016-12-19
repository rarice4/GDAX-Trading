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

var openOrder = null;

function tradeCycle(){
  strategy.tradeDirection(authedClient, publicClient).then(function(direction){
    console.log("Direction", direction);
    marketAction(direction).then(function(action){
      console.log("ACTION",action);
      switch (action) {
        case "buy":
          accounts.buyBTC(authedClient, publicClient).then(function(order){
            openOrder = order.id;
            newTradeCycle();
          });
          break;
        case "sell":
        accounts.sellBTC(authedClient, publicClient).then(function(order){
          openOrder = order.id;
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
  //1 day and 1/8 day moving average
  return strategy.dualMovingAvgSignal(publicClient, direction, 1, .125)
}
function newTradeCycle(){
  // start new tradeCycle after 5 minutes
  setTimeout(function(){tradeCycle()},300000);
}

//start first trade cycle
tradeCycle()

// accounts.cancelOpenOrder(authedClient,openOrder).then(function(resp){
//   console.log("$$",resp);
// }).catch(function(err){
//     console.log("Cancel order Err:",err);
// })
