
let REMOTE_URL = 'http://localhost:3000';


// Fetch items from the backend
function fetchItems() {
    $.ajax({
        url: `${REMOTE_URL}/items/list`,  // Backend route to fetch all items
        method: 'GET',
        success: function(data) {
            renderItems(data);  // Render the items fetched from the backend
        },
        error: function(error) {
            console.error('Error fetching items', error);
            $('#items-list').html('<p>Error loading items. Please try again later.</p>');
        }
    });
}

// Render the fetched items on the page
function renderItems(items) {
    let itemsHtml = items.item.map(item => `
    <div class="col-md-4 mb-3">
        <div class="card shop-card">
            <img src="img/${item.picture}" class="card-img-top" alt="${item.itemName}">
            <div class="card-body">
                <h5 class="card-title">${item.itemName}</h5>
                <p class="card-text">Country: ${item.country}</p>
                <p class="card-text">Period: ${item.period} (${item.year})</p>
                <p class="card-text">Price: $${item.price}</p>
                <button class="btn btn-primary view-details-btn" data-item-id="${item._id}">View Details</button>
                <button class="btn btn-success add-to-cart-btn" data-item-id="${item._id}">Add to Cart</button>
            </div>
        </div>
    </div>`
    ).join('');

    $('#items-list').html(itemsHtml);
}

// Fetch item details from the backend
function fetchItemDetails(itemId) {
    $.ajax({
        url: `${REMOTE_URL}/items/get?id=${itemId}`,  // Fetch individual item details
        method: 'GET',
        success: function(item) {
            showItemDetails(item);  // Populate the modal with item details
        },
        error: function(error) {
            console.error('Error fetching item details', error);
            alert('Error loading item details. Please try again later.');
        }
    });
}

// Display item details in the modal
function showItemDetails(item) {
    let itemDetailsHtml = `
    <img src="${item.picture}" class="img-fluid mb-3" alt="${item.itemName}">
    <h4>${item.itemName}</h4>
    <p>Country: ${item.country}</p>
    <p>Period: ${item.period} (${item.year})</p>
    <p>Price: $${item.price}</p>
    <p>Quantity: ${item.quantity}</p>
`;

    $('#item-details').html(itemDetailsHtml);
    $('#add-to-cart-modal').data('item-id', item._id);  // Store item ID in the modal's button
    $('#itemModal').modal('show');
}


// Handle view details button click
$(document).on('click', '.view-details-btn', function () {
    let itemId = $(this).data('item-id');
    fetchItemDetails(itemId);
});


// Initial page load: fetch and display all items and cart
$(document).ready(function() {
    fetchItems();
});