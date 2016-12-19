var accounts = require('./accounts.js');
var market = require('./marketData.js');
var chalk = require('chalk');
// returns direction money needs to move
var tradeDirection = function(client,publicClient){
  return new Promise(function(resolve,reject){
    return accounts.holdings(client).then(function(account){
      return market.bidAsk(publicClient).then(function(book){
        //console.log("book",book);
        var priceAvg = (parseFloat(book.bids[0][0]) + parseFloat(book.asks[0][0]))/2;
        //console.log("price AVG", priceAvg);
        var btcHoldings = parseFloat(account.btc.balance) * priceAvg;
        var usdHoldings = parseFloat(account.usd.balance);
        if (btcHoldings > usdHoldings){
          return resolve("USD");

        }else{
          return resolve("BTC");
        }

      });
    })
  })
};
//simple moving average
var _movingAvg = function(publicClient,days){

  var today = new Date();
  var dataPoints = (86400 * days)/24; //25 data points
  var params = {
    'end': today.toISOString(),
    'start': new Date(today.getTime() - days*24*60*60*1000).toISOString(),
    'granularity': dataPoints //
  };
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      publicClient.getProductHistoricRates(params, function(err,response, data){
        if(data.message) console.log(chalk.red(data.message));
        var points = data.map(function(item){
          item[0] = new Date(parseInt(item[0].toString() + "000"));
          return item;
        })
         points = points.reduce(function(a, b) {
        return a.concat(b[1]).concat(b[2]);
      }, []);
          //console.log("points",points);
      avg = points.reduce(function(a,b){return a+b})/points.length;
      //console.log("Moving AVG", avg);
      console.log("Length:",points.length);
          return resolve(avg);
      })
    },1000);
  });
}
// trade signal based on moving average cross
// params: number of days
var _dualMovingAvgSignal = function(publicClient,direction, long,short){
  return _movingAvg(publicClient, long).then(function(longAvg){
  console.log("Long Avg",longAvg);
    return _movingAvg(publicClient, short).then(function(shortAvg){
    console.log("Short Avg",shortAvg);
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

module.exports = {
  tradeDirection: tradeDirection,
  movingAvg: _movingAvg,
  dualMovingAvgSignal: _dualMovingAvgSignal
};
