'use strict';

const
  app = require('express')(),
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

  log('CONNECT');
  emitProducts();
  emitOrders();

  socket.on('disconnect', () => {
    const userName = sockets[socketId];
    log('DISCONNECT', { userName });
    if (typeof orders[userName] !== 'undefined' && orders[userName].product === '') {
      delete orders[userName];
    }
    delete sockets[socketId];
    emitOrders();
  });

  socket.on('register', (userName, fn) => {
    const result = register(userName, clientIp);
    log('REGISTER', { userName, result });
    fn(result);
    if (result.success) {
      sockets[socketId] = userName;
      orders[userName] = orders[userName] || { clientIp, product: '' };
      emitOrders();
    }
  });

  socket.on('product', productName => {
    if (products.indexOf(productName) === -1) {
      log('ADD PRODUCT', { userName: sockets[socketId], productName });
      products.push(productName);
      emitProducts();
    }
  });

  socket.on('order', productName => {
    const userName = sockets[socketId];
    log('ADD ORDER', { userName, productName });
    orders[userName].product = productName;
    emitOrders();
  });

  function log(event, ...objs) {
    console.log(new Date() + ' ' + event, { socketId, clientIp }, ...objs);
  }

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});


function register(userName, clientIp) {
  if (userName.trim() === '') {
    return { success: false, errorCode: 'USER_NAME_CANNOT_BE_WHITE_SPACES' };
  }
  const userNames = Object.keys(orders);
  if (userNames.indexOf(userName) !== -1 && orders[userName].clientIp !== clientIp) {
    return { success: false, errorCode: 'USER_NAME_EXISTS' };
  }
  return { success: true };
}

function emitProducts() {
  io.emit('products', products);
}

function emitOrders() {
  const ordersViewModel = Object.keys(orders).reduce((accumulator, key) => {
    return Object.assign({}, accumulator, { [key]: orders[key].product });
  }, {});
  io.emit('orders', ordersViewModel);
}
