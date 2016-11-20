var accounts = require('./accounts.js');
var market = require('./marketData.js');
// returns direction money needs to move
var tradeDirection = function(client,publicClient){
  return new Promise(function(resolve,reject){
    return accounts.holdings(client).then(function(account){
      return market.bidAsk(publicClient).then(function(book){
        console.log("book",book);
        var priceAvg = (parseFloat(book.bids[0][0]) + parseFloat(book.asks[0][0]))/2;
        console.log("price AVG", priceAvg);
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

var _movingAvg = function(params){
  var params = {'granularity': 3000};
  return new Promise(function(resolve,reject){
    return publicClient.getProductHistoricRates(params, function(err,response, data){
        console.log("HISTORICAL data", data);
        return resolve();
    })
  });
}


module.exports = {
  tradeDirection: tradeDirection
};
