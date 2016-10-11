'use strict';

const
  app = require('express')(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  config = require('./config.js');

let
  orders = {},
  products = config.products;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  io.emit('products', products);
  io.emit('orders', orders);

  socket.on('product', product => {
    products.push(product);
    io.emit('products', products);
  });

  socket.on('order', (party, product) => {
    if (product !== '') {
      orders[party] = product;
    } else {
      delete orders[party];
    }
    io.emit('orders', orders);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
