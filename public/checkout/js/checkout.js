async function getItemData(item) {
    const item_data = await fetch(`/items/get?itemName=${encodeURIComponent(item)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })

    let data = await item_data.json();
    return data.item.price


}

document.getElementById('checkout-form').addEventListener('submit', async function (event) {
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

    event.preventDefault();
    let items = [];
    const cart_items = await fetch("/cart/get", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

    })
    let data = await cart_items.json();
    let cart_data = {};
    let item_names = [];
    let price = 0;
    if(data.cart) {
        for (const item of data.cart) {
            cart_data[item] = await getItemData(item);
            price += cart_data[item];
            item_names.push(item);
            const order = await fetch("/cart/remove", {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemName: item

                })

            })

        }
    }
    const order = await fetch("/order/add", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId: formData.orderId,
            items: item_names,
            total: price
        })

    })

    localStorage.setItem('cart_data', JSON.stringify(cart_data));
    localStorage.setItem('total_price', price.toString());
    localStorage.setItem('checkoutData', JSON.stringify(formData));
    window.location.href = '/orderconfirm';




});




