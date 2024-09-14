// Get the order ID from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

// Display the order ID
document.getElementById('order-id').textContent = orderId;