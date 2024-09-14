document.getElementById('checkout-form').addEventListener('submit', function(event) {
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value,
        country: document.getElementById('country').value,
        cardName: document.getElementById('card-name').value,
        cardNumber: document.getElementById('card-number').value,
        cvv: document.getElementById('cvv').value,
        expiryDate: document.getElementById('expiry-date').value,
        orderId: Math.floor(Math.random() * 100000)

    };



    const cardNumberPattern = /^[0-9]{16}$/;
    const cvvPattern = /^[0-9]{3,4}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;

    if (!cardNumberPattern.test(formData.cardNumber)) {
        alert('Invalid card number. Must be 16 digits.');
        event.preventDefault();
        return;
    }

    if (!cvvPattern.test(formData.cvv)) {
        alert('Invalid CVV. Must be 3 or 4 digits.');
        event.preventDefault();
        return;
    }

    if (!expiryPattern.test(formData.expiryDate)) {
        alert('Invalid expiry date. Must be MM/YY format.');
        event.preventDefault();
        return;
    }

    const product = "meow";
    const quantity = 5;

    localStorage.setItem('checkoutData', JSON.stringify(formData));
    window.location.href = '/orderconfirm';
});




