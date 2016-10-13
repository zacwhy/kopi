'use strict';

const
  app = require('express')(),
  bodyParser = require('body-parser'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  config = require('./config.js');

let
  orders = {},
  products = config.products;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/order', (req, res) => {
  const
    address = req.ip,
    party = req.body.party,
    product = req.body.product;

  if (typeof orders[party] !== 'undefined' && orders[party].address !== address) {
    res.status(401)
  } else {
    if (product !== '') {
      orders[party] = { address, product };
    } else {
      delete orders[party];
    }
    emitOrders();    
  }

  res.end();
});

io.on('connection', socket => {
  emitProducts();
  emitOrders();

  socket.on('product', product => {
    products.push(product);
    emitProducts();
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

function emitProducts() {
  io.emit('products', products);
}

function emitOrders() {
  const viewModel = Object.keys(orders).reduce((accumulator, key) => {
    accumulator[key] = orders[key].product;
    return accumulator;
  }, {});
  io.emit('orders', viewModel);
}
