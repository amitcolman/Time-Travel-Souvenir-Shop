$(document).ready(function() {
    const REMOTE_URL = 'http://localhost:3000';
    const $cartItemsContainer = $('#cart-items');
    const $cartMessage = $('#cart-message');
    const $checkoutButton = $('#checkout-button');
    let hasOutOfStockItems = false;

    function removeCartItem(itemName, $itemElement) {
        $.ajax({
            url: `${REMOTE_URL}/cart/remove?itemName=${itemName}`,
            method: 'DELETE',
            success: function() {
                $itemElement.remove();
                loadItems()
            },
            error: function() {
                console.error(`Error removing item: ${itemName}`);
                alert('Error removing item from cart.');
            }
        });
    }

    function loadItems(){
        $.ajax({
            url: `${REMOTE_URL}/cart/get`,
            method: 'GET',
            success: function(cartRes) {
                $cartItemsContainer.empty();
                if (cartRes.cart.length > 0) {
                    cartRes.cart.forEach(item => {
                        $.ajax({
                            url: `${REMOTE_URL}/items/get?itemName=${item}`,
                            method: 'GET',
                            success: function(itemRes) {
                                const price = itemRes.item.price;
                                const picture =  `/products/img/${itemRes.item.picture}`;
                                const outOfStock = itemRes.item.quantity < 1;

                                if (outOfStock) {
                                    hasOutOfStockItems = true;
                                }

                                const $itemElement = $(`
                                <div class="cart-item col-md-6">
                                    <img src="${picture}" alt="${item}" class="img-fluid ${outOfStock ? 'out-of-stock-img' : ''}">
                                    <h4>${item} ${outOfStock ? '(Out of Stock)' : ''}</h4>
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
                    $cartMessage.html('No items yet.<br><a href="/products">Start shopping</a>');
                }
            },
            error: function() {
                console.error('Error fetching cart items');
                $cartMessage.html('Error retrieving cart items.');
            }
        });
    }


    loadItems()

    $checkoutButton.on('click', function() {
        if (hasOutOfStockItems) {
            alert('One or more items in your cart are out of stock and cannot be purchased.');
            return false;

        }
    });

})
