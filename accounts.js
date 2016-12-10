var Promise = require('promise');
var market = require('./marketData.js');
var _holdings = function(client){
  return new Promise(function(resolve, reject){
    client.getAccounts(function(err, response, data) {
      //console.log(JSON.parse(response.body));
      var accounts = {};

      accounts.btc = JSON.parse(response.body).filter(function(account){
        if(account.currency === "BTC"){
          return account;
        }
      })[0];

      accounts.usd = JSON.parse(response.body).filter(function(account){
        if(account.currency === "USD"){
          return account;
        }
      })[0];
      console.log("Accounts", accounts);
      resolve(accounts);
    });
  });
};
var _sellBTC = function(authedclient,publicClient){
  var sellParams = {
    'price': '110.00', // USD
    'size': '1', // BTC
    'product_id': 'BTC-USD',
  };
  _holdings(authedclient).then(function(account){
    console.log("account",account.btc.available);
    var clearedBTC = account.btc.available;
    market.bidAsk(publicClient).then(function(data){
      console.log("###", (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2);
      var bidAskAvg = ((parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2).toFixed(2)
      console.log("bidAskAvg",bidAskAvg);
      var sellParams = {
        'price': bidAskAvg, // USD
        'size': clearedBTC, // BTC
        'product_id': 'BTC-USD',
      };
      console.log("sellParams",sellParams);
      authedclient.sell(sellParams, function(err, response, data){
        if(!err){
          if(response.statusCode != '200'){
          console.log("BAD SELL REQUEST:",response.statusCode);
        }else{
          console.log("SELL SUCCESS:",response.body,response.message);
          }
        }else{
          console.log("ERR Selling",err);
        }
      });
    });

  });

}

module.exports = {
  holdings: _holdings,
  sellBTC: _sellBTC
};
