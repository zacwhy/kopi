'use strict';

const
  app = require('express')(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  config = require('./config.js');

let orders = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  io.emit('orders', orders);

  socket.on('order', (party, product) => {
    orders[party] = product;
    io.emit('orders', orders);
  });
});

app.get('/products', (req, res) => {
  res.send(config.products);
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
