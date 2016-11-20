var _bidAsk = function(publicClient){
  return new Promise(function(resolve,reject){
    return publicClient.getProductOrderBook(function(err, response, data) {
      console.log("book",data);
      resolve(data);
    });
  });
};

module.exports = {
  bidAsk: _bidAsk
};
