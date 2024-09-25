$(document).ready(function() {
    const REMOTE_URL = 'http://localhost:3000';
    const $cartItemsContainer = $('#cart-items');
    const $cartMessage = $('#cart-message');
    const $checkoutButton = $('#checkout-button');

    function removeCartItem(itemName, $itemElement) {
        $.ajax({
            url: `${REMOTE_URL}/cart/remove?itemName=${itemName}`,
            method: 'DELETE',
            success: function() {
                $itemElement.remove();
                if ($cartItemsContainer.children().length === 0) {
                    $cartMessage.html('No items yet.<br><a href="/products">Start shopping</a>');
                    $checkoutButton.hide();
                }
            },
            error: function() {
                console.error(`Error removing item: ${itemName}`);
                alert('Error removing item from cart.');
            }
        });
    }


    $.ajax({
        url: `${REMOTE_URL}/cart/get`,
        method: 'GET',
        success: function(cartRes) {
            if (cartRes.cart.length > 0) {
                // Iterate through cart items to get their prices
                cartRes.cart.forEach(item => {
                    // For each item, fetch its price
                    $.ajax({
                        url: `${REMOTE_URL}/items/get?itemName=${item}`,
                        method: 'GET',
                        success: function(itemRes) {
                            const price = itemRes.item.price;
                            const picture =  `/products/img/${itemRes.item.picture}`;

                            const $itemElement = $(`
                                <div class="cart-item col-md-6)">
                                    <img src="${picture}" alt="${item}" class="img-fluid">  
                                    <h4>${item}</h4>
                                    <p class="price">${price.toFixed(2)}₪</p>
                                    <button class="btn btn-danger remove-btn">Remove</button>
                                </div>
                            `)
                            $cartItemsContainer.append($itemElement);

                            $itemElement.find('.remove-btn').on('click', function() {
                                removeCartItem(item, $itemElement);
                            });
                        },
                        error: function() {
                            console.error(`Error fetching price for item: ${item.itemName}`);
                        }
                    });
                });
                $checkoutButton.show();

            } else {
                $cartMessage.html = 'No items yet.<br><a href="/products">Start shopping</a>';
            }
        },
        error: function() {
            console.error('Error fetching cart items');
            $cartMessage.innerHTML = 'Error retrieving cart items.';
        }
    });
})
