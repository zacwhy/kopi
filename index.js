'use strict';

const
  app = require('express')(),
  bodyParser = require('body-parser'),
  express = require('express'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  config = require('./config.js');

let
  orders = {},
  products = config.products,
  sockets = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  const
    clientIp = socket.request.connection.remoteAddress,
    socketId = socket.id;

  emitProducts();
  emitOrders();

  socket.on('disconnect', () => {
    const userName = sockets[socketId];
    if (typeof orders[userName] !== 'undefined' && orders[userName].product === '') {
      delete orders[userName];
    }
    delete sockets[socketId];
    emitOrders();
  });

  socket.on('register', (userName, fn) => {
    if (userName.trim() === '') {
      fn({
        success: false,
        message: 'Name cannot be white spaces'
      });
      return;
    }

    const userNames = Object.keys(orders);
    if (userNames.indexOf(userName) !== -1 && orders[userName].clientIp !== clientIp) {
      fn({
        success: false,
        message: `There is already someone with name '${userName}'`
      });
      return;
    }

    sockets[socketId] = userName;
    orders[userName] = orders[userName] || { clientIp, product: '' };
    fn({ success: true });
    emitOrders();
  });

  socket.on('product', productName => {
    if (products.indexOf(productName) === -1) {
      products.push(productName);
      emitProducts();
    }
  });

  socket.on('order', productName => {
    const userName = sockets[socketId];
    orders[userName].product = productName;
    emitOrders();
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

function emitProducts() {
  io.emit('products', products);
}

function emitOrders() {
  const ordersViewModel = Object.keys(orders).reduce((accumulator, key) => {
    return Object.assign({}, accumulator, { [key]: orders[key].product });
  }, {});
  io.emit('orders', ordersViewModel);
}
