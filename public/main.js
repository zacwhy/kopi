const socket = io();

socket.on('products', products => {
  const select = document.getElementById('product');
  select.options.length = 0;
  [''].concat(products).forEach(product => {
    const option = document.createElement('option');
    option.value = product;
    option.innerHTML = product;
    select.appendChild(option);
  });
});

socket.on('orders', orders => {
  document.getElementById('json').innerHTML = JSON.stringify(orders, undefined, 2);
});

document.getElementById('newProduct').onclick = () => {
  const product = prompt('Product name');
  if (product !== null) {
    socket.emit('product', product);
  }
};

document.getElementById('order').onsubmit = () => {
  fetch('/order', {
    method: 'post',
    headers: { "Content-Type" : "application/json" },
    body: JSON.stringify({
      party: document.getElementById('party').value,
      product: document.getElementById('product').value
    })
  }).then(response => {
    if (!response.ok) {
      alert('You can only modify your own order.');
    }
  });
  return false;
};
