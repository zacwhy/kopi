'use strict';

var
  socket = io(),

  ordersSection = element('orders'),
  productsSelect = element('products'),
  registerForm = element('register');

hideElement(ordersSection);

registerForm.onsubmit = function () {
  var userName = element('userName').value.trim();
  socket.emit('register', userName, function (data) {
    if (data.success) {
      element('userNameDisplay').innerHTML = userName;
      hideElement(registerForm);
      showElement(ordersSection);
    } else {
      alert(data.message);
    }
  });
  return false;
};

productsSelect.onchange = function () {
  var productName = productsSelect.options[productsSelect.selectedIndex].value;
  socket.emit('order', productName);
};

element('newProduct').onclick = function () {
  var productName = prompt('Product name');
  if (productName !== null) {
    socket.emit('product', productName);
  }
};

socket.on('products', function (products) {
  productsSelect.options.length = 0;
  [''].concat(products).forEach(function (product) {
    var option = document.createElement('option');
    option.value = product;
    option.innerHTML = product;
    productsSelect.appendChild(option);
  });
});

socket.on('orders', function (orders) {
  element('json').innerHTML = JSON.stringify(orders, undefined, 2);
});

function element(id) {
  return document.getElementById(id);
}

function hideElement(element) {
  element.style.display = 'none';
}

function showElement(element) {
  element.style.display = 'block';
}
