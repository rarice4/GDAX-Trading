var Gdax = require('gdax');
var access = require('./access.js');
var Promise = require('promise')
console.log("Access:", access);
var publicClient = new Gdax.PublicClient();
var authedClient = new Gdax.AuthenticatedClient(access.key, access.b64secret, access.passphrase);
var callback = function(err, response, data) {
  console.log(response.body);
};
authedClient.getAccounts(function(err, response, data) {
  console.log(JSON.parse(response.body)[0]);
  return JSON.parse(response.body)[0];
});
