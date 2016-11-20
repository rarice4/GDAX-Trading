var Promise = require('promise');
var holdings = function(client){
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

module.exports = {
  holdings: holdings
};
