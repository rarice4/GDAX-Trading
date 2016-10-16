var Gdax = require('gdax');
var access = require('./access.js');
console.log("Access:", access);
var publicClient = new Gdax.PublicClient();
var authedClient = new Gdax.AuthenticatedClient(access.key, access.b64secret, access.passphrase);
var callback = function(err, response, data) {
  console.log(response.body);
};
publicClient.getProducts(callback);
