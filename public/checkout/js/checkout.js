$(document).ready(function () {
    const REMOTE_URL = 'http://localhost:3000';

    async function getItemData(item) {
        try {
            const response = await $.ajax({
                url: `${REMOTE_URL}/items/get?itemName=${encodeURIComponent(item)}`,
                method: 'GET',
                dataType: 'json'
            });
            return response.item.price;
        } catch (error) {
            console.error(`Error fetching data for item ${item}:`, error);
            throw error;
        }
    }

    async function processCartItems(cart) {
        let cart_data = {};
        let totalPrice = 0;
        let item_names = [];

        for (const item of cart) {
            try {
                const itemPrice = await getItemData(item);
                cart_data[item] = itemPrice;
                totalPrice += itemPrice;
                item_names.push(item);

                await $.ajax({
                    url: `${REMOTE_URL}/items/quantity-remove-one?itemName=${item}`,
                    method: 'GET'
                });

                await $.ajax({
                    url: `${REMOTE_URL}/cart/remove?itemName=${item}`,
                    method: 'DELETE'
                });

            } catch (error) {
                console.error(`Error processing item ${item}:`, error);
            }
        }

        return { cart_data, totalPrice, item_names };
    }

    $('#checkout-form').on('submit', async function (event) {
        event.preventDefault();

        const formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: $('#address').val(),
            city: $('#city').val(),
            zip: $('#zip').val(),
            country: $('#country').val(),
            cardName: $('#card-name').val(),
            cardNumber: $('#card-number').val(),
            cvv: $('#cvv').val(),
            expiryDate: $('#expiry-date').val(),
            orderId: Math.floor(Math.random() * 100000)
        };

        const cardNumberPattern = /^[0-9]{16}$/;
        const cvvPattern = /^[0-9]{3,4}$/;
        const expiryPattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;

        if (!cardNumberPattern.test(formData.cardNumber)) {
            alert('Invalid card number. Must be 16 digits.');
            return;
        }

        if (!cvvPattern.test(formData.cvv)) {
            alert('Invalid CVV. Must be 3 or 4 digits.');
            return;
        }

        if (!expiryPattern.test(formData.expiryDate)) {
            alert('Invalid expiry date. Must be MM/YY format.');
            return;
        }

        try {
            const cartResponse = await $.ajax({
                url: `${REMOTE_URL}/cart/get`,
                method: 'GET',
                dataType: 'json'
            });

            if (cartResponse.cart) {
                const { cart_data, totalPrice, item_names } = await processCartItems(cartResponse.cart);

                await $.ajax({
                    url: `${REMOTE_URL}/order/add`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        orderId: formData.orderId,
                        items: item_names,
                        total: totalPrice
                    })
                });

                localStorage.setItem('cart_data', JSON.stringify(cart_data));
                localStorage.setItem('total_price', totalPrice.toString());
                localStorage.setItem('checkoutData', JSON.stringify(formData));

                window.location.href = '/orderconfirm';
            }

        } catch (error) {
            console.error('Error during the checkout process:', error);
            alert('An error occurred during the checkout process. Please try again.');
        }
    });
});
