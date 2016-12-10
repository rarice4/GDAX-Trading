var accounts = require('./accounts.js');
var market = require('./marketData.js');
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

var _movingAvg = function(publicClient,days){
  var today = new Date();
  var dataPoints = (86400 * days)/24; //25 data points
  var params = {
    'end': today.toISOString(),
    'start': new Date(today.getTime() - days*24*60*60*1000).toISOString(),
    'granularity': dataPoints //
  };
  return new Promise(function(resolve,reject){
    publicClient.getProductHistoricRates(params, function(err,response, data){
      if(data.message) console.log("err!", data.message);
      var points = data.map(function(item){
        item[0] = new Date(parseInt(item[0].toString() + "000"));
        return item;
      })
      //console.log("points",points);
       points = points.reduce(function(a, b) {
      return a.concat(b[1]).concat(b[2]);
    }, []);
    avg = points.reduce(function(a,b){return a+b})/points.length;
    //console.log("Moving AVG", avg);
    console.log("Length:",points.length);
        return resolve(avg);
    })
  });
}

module.exports = {
  tradeDirection: tradeDirection,
  movingAvg: _movingAvg
};
