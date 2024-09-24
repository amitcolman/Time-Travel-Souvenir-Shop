
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');


document.getElementById('order-id').textContent = orderId;