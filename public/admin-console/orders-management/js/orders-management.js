$(document).ready(function () {
    let ordersData = [];
    let filteredOrders = [];
    let sortOrder = {
        orderId: 'asc',
        username: 'asc',
        items: 'asc',
        total: 'asc'
    };

    // Load orders and popups
    loadOrders();
    loadPopups();

    // Sort orders by column
    $('#sort-orderId').click(() => toggleSort('orderId'));
    $('#sort-username').click(() => toggleSort('username'));
    $('#sort-items').click(() => toggleSort('items'));
    $('#sort-total').click(() => toggleSort('total'));

    // Filter orders by search
    $('#search-order').on('input', filterOrders);

    // Function to load orders from server
    function loadOrders() {
        $.ajax({
            url: '/order/get-all-orders',
            type: 'GET',
            dataType: 'json',
            success: function (orders) {
                ordersData = orders;
                filteredOrders = ordersData;
                renderTable(filteredOrders);
            },
            error: function (error) {
                console.error('Error fetching orders:', error);
            }
        });
    }

    // Function to load popups
    function loadPopups() {
        $.ajax({
            url: '/admin-console/popups.html',
            type: 'GET',
            dataType: 'html',
            success: function (data) {
                const $html = $('<div>').html(data);
                const relevantPopups = $html.find('#order-management-edit-popup, ' +
                    '#order-management-delete-popup, #order-management-success-popup, #order-management-error-popup');
                $('body').append(relevantPopups);
                bindClosePopupButtons();
            },
            error: function (error) {
                console.error('Error loading pop-ups:', error);
            }
        });
    }

    // Sort toggle for columns
    function toggleSort(column) {
        sortOrder[column] = sortOrder[column] === 'asc' ? 'desc' : 'asc';
        sortTable(column, sortOrder[column]);
        updateArrowIcons(column, sortOrder[column]);
    }

    // Function to sort table
    function sortTable(column, order) {
        filteredOrders.sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];

            if (Array.isArray(aValue)) {
                aValue = aValue.join(', ');
            }
            if (Array.isArray(bValue)) {
                bValue = bValue.join(', ');
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        renderTable(filteredOrders);
    }

    // Update arrow icons for sorting
    function updateArrowIcons(column, order) {
        $('#orderId-arrow, #username-arrow, #items-arrow, #total-arrow').text('');
        const arrow = order === 'asc' ? '▲' : '▼';
        $('#' + column + '-arrow').text(arrow);
    }

    // Function to filter orders by search input
    function filterOrders() {
        const searchQuery = $('#search-order').val().toLowerCase();
        filteredOrders = ordersData.filter(order => {
            console.log(order);
            const orderIdMatches = order.orderId && order.orderId.toLowerCase().includes(searchQuery);
            const usernameMatches = order.username && order.username.toLowerCase().includes(searchQuery);
            return orderIdMatches || usernameMatches;
        });
        renderTable(filteredOrders);
    }

    // Render table with orders
    function renderTable(orders) {
        const tableBody = $('#orderTableBody');
        tableBody.empty();

        orders.forEach(order => {
            const row = `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.username}</td>
                    <td>${order.items.join(', ')}</td>
                    <td>${order.total}</td>
                    <td>
                        <a href="#" class="edit-order" data-id="${order._id}">[Edit]</a>
                        <a href="#" class="delete-order" data-id="${order._id}">[Delete]</a>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Bind event listeners after table is rendered
        bindEventListeners();
    }

    // Bind event listeners for table actions
    function bindEventListeners() {
        $('.edit-order').click(handleEditOrder);
        $('.delete-order').click(handleDeleteOrder);
    }

    function handleEditOrder(event) {
        event.preventDefault();

        const orderId = $(this).data('id');
        const order = ordersData.find(o => o._id === orderId);
        if (order) {
            togglePopup('#order-management-edit-popup', true);
            fillOrderForm(order);

            // Make the click event handler function async
            $('#save-edit-order-btn').off('click').on('click', async function() {
                const orderData = getOrderFormData();
                const isValid = await validateOrderFormData(orderData);
                if (isValid) {
                    $.ajax({
                        url: '/order/update',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ orderId: order.orderId, ...orderData }),
                        success: function() {
                            togglePopup('#order-management-edit-popup', false); // Close the popup
                            loadOrders(); // Reload orders table
                        },
                        error: function(error) {
                            console.error('Error updating order:', error);
                        }
                    });
                }
            });

            $('#cancel-order-edit-btn').off('click').on('click', function() {
                togglePopup('#order-management-edit-popup', false);
            });
        }
    }


    // Handle deleting an order
    function handleDeleteOrder(event) {
        event.preventDefault();

        const orderId = $(this).data('id'); // Get the order ID from the button's data attribute

        togglePopup('#order-management-delete-popup', true); // Show delete confirmation popup

        // Confirm delete action
        $('#confirm-delete-order-btn').off('click').on('click', function() {
            $.ajax({
                url: '/order/remove',
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({ orderId: orderId }), // Pass the order ID to the API
                success: function() {
                    togglePopup('#order-management-delete-popup', false); // Close the delete confirmation popup
                    togglePopup('#order-management-success-popup', true); // Show success popup
                    loadOrders(); // Reload the orders table
                },
                error: function(error) {
                    togglePopup('#order-management-delete-popup', false); // Close the delete confirmation popup
                    togglePopup('#order-management-error-popup', true); // Show error popup
                    console.error('Error deleting order:', error);
                }
            });
        });

        // Cancel delete action
        $('#cancel-delete-order-btn').off('click').on('click', function() {
            togglePopup('#order-management-delete-popup', false); // Hide delete confirmation popup
        });
    }


    // Utility function to toggle popups
    function togglePopup(popupId, show = true) {
        const popup = $(popupId);
        popup.css('display', show ? 'flex' : 'none');
        if (!show) {
            popup.find('input').val('');
        }
    }

    // Utility function to fill the order form
    function fillOrderForm(order) {
        $('#edit-order-items').val(order.items.join(', '));
        $('#edit-order-total').val(order.total);
    }

    async function validateOrderFormData(orderData) {
        // Check if the items and total are valid
        if (!orderData.items || isNaN(orderData.total)) {
            alert('Please fill in all fields correctly.');
            return false;
        }
        // Split the items into a list (assuming they are comma-separated)
        const itemsList = orderData.items.split(',').map(item => item.trim());

        // Loop through each item in the order to check its existence and stock via backend
        for (let itemName of itemsList) {
            const isValid = await validateItemExists(itemName);  // Await backend validation
            if (!isValid) {
                return false;  // Stop validation if any item is invalid
            }
        }

        if (orderData.total <= 0)
        {
            alert('Value must be a positive number');
            return false;
        }

        return true;  // All items are valid
    }

    async function validateItemExists(itemName) {
        try {
            const response = await $.ajax({
                url: '/items/get',  // Backend route to check the item
                type: 'GET',
                data: { itemName: itemName },  // Send item name as query parameter
                dataType: 'json'
            });

            // If the item exists and is in stock
            if (response.item.quantity > 0) {
                return true;
            } else {
                alert(`Item '${itemName}' is out of stock.`);
                return false;
            }
        } catch (error) {
            // Handle case when item is not found or server error
            if (error.status === 404) {
                alert(`Item '${itemName}' does not exist in the store.`);
            } else {
                alert(`Error fetching item '${itemName}': ${error.responseText || error.statusText}`);
            }
            return false;
        }
    }


    // Close buttons for popups
    function bindClosePopupButtons() {
        $('.popup-container .btn').off('click').on('click', function () {
            const popup = $(this).closest('.popup-container');
            popup.css('display', 'none');
        });
    }

    function getOrderFormData() {
        const items = $('#edit-order-items').val();
        const total = parseFloat($('#edit-order-total').val());

        return {
            items: items,
            total: total
        };
    }

});
