var Promise = require('promise');
var market = require('./marketData.js');
var chalk = require('chalk');
var _holdings = function(client){
  return new Promise(function(resolve, reject){
    //delay get by 2 sets so trade cycle does not exceed limit of 4 calls per second to gdax api
    setTimeout(function(){
      client.getAccounts(function(err, response, data) {
        //console.log(JSON.parse(response.body));
        var accounts = {};
  if(data.message)console.log(chalk.red(data.message));
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
    },1000)

  });
};
var _sellBTC = function(authedclient,publicClient){
  return _holdings(authedclient).then(function(account){
    console.log("account",account.btc.available);
    var clearedBTC = account.btc.available;
    return market.bidAsk(publicClient).then(function(data){
      console.log("###", (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2);
      var bidAskAvg = ((parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2).toFixed(2)
      console.log("bidAskAvg",bidAskAvg);
      var sellParams = {
        'price': bidAskAvg, // USD
        'size': clearedBTC, // BTC
        'product_id': 'BTC-USD',
      };
      console.log("sellParams",sellParams);
      return new Promise(function(resolve, reject){
        setTimeout(function(){
        authedclient.sell(sellParams, function(err, response, data){
          if(!err){
            if(response.statusCode != '200'){
            console.log("BAD SELL REQUEST:",response.statusCode);
            reject(response);
          }else{
            console.log("SELL SUCCESS:",response.body,response.message);
            resolve(response.body);
            }
          }else{
            console.log("ERR Selling",err);
            reject(err);
          }
        });
      },1000);
    });
    });

  });

}
var _buyBTC = function(authedclient,publicClient){

  return _holdings(authedclient).then(function(account){
    console.log("account",account.usd.available);
    var clearedUSD = account.usd.available;
    return market.bidAsk(publicClient).then(function(data){
      console.log("###", (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2);
      var bidAskAvg = ((parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0]))/2).toFixed(2)
      console.log("bidAskAvg",bidAskAvg);
      //25 cent transaction fee
      var sizeBTC = ((clearedUSD -1)/bidAskAvg).toFixed(6);
      console.log("sizeBTC",sizeBTC);
      var buyParams = {
        'price': bidAskAvg, // USD
        'size': sizeBTC, // BTC
        'product_id': 'BTC-USD',
      };
      console.log("buyParams",buyParams);
      return new Promise(function(resolve, reject){
        authedclient.buy(buyParams, function(err, response, data){
          if(!err){
            if(response.statusCode != '200'){
            console.log("BAD BUY REQUEST:",response.statusCode,response,buyParams);
            reject(response);
          }else{
            console.log("BUY SUCCESS:",response.body,response.message);
            resolve(response.body);
            }
          }else{
            console.log("ERR BUYING",err);
            reject(err);
          }
        });
      });
    });

  });

}

var _cancelOpenOrder = function(authedClient, id){
  return new Promise(function(resolve, reject){
      authedClient.cancelOrder(id, function(err, response, data){
        if(data[0] === id){
          resolve(data);
        }else{
          reject(data.message);
        }

      });
  });

}

module.exports = {
  holdings: _holdings,
  sellBTC: _sellBTC,
  buyBTC: _buyBTC,
  cancelOpenOrder:_cancelOpenOrder
};
