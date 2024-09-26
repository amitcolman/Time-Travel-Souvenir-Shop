$(document).ready(function () {
    let ordersData = [];
    let filteredOrders = [];
    let sortOrder = {
        orderId: 'asc',
        username: 'asc',
        items: 'asc',
        total: 'asc'
    };

    loadOrders();
    loadPopups();

    $('#sort-orderId').click(() => toggleSort('orderId'));
    $('#sort-username').click(() => toggleSort('username'));
    $('#sort-items').click(() => toggleSort('items'));
    $('#sort-total').click(() => toggleSort('total'));
    $('#search-order').on('input', filterOrders);

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

    function toggleSort(column) {
        sortOrder[column] = sortOrder[column] === 'asc' ? 'desc' : 'asc';
        sortTable(column, sortOrder[column]);
        updateArrowIcons(column, sortOrder[column]);
    }

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

    function updateArrowIcons(column, order) {
        $('#orderId-arrow, #username-arrow, #items-arrow, #total-arrow').text('');
        const arrow = order === 'asc' ? '▲' : '▼';
        $('#' + column + '-arrow').text(arrow);
    }

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


        bindEventListeners();
    }

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


            $('#save-edit-order-btn').off('click').on('click', async function () {
                const orderData = getOrderFormData();
                const isValid = await validateOrderFormData(orderData);
                if (isValid) {
                    $.ajax({
                        url: '/order/update',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({orderId: order.orderId, ...orderData}),
                        success: function () {
                            togglePopup('#order-management-edit-popup', false);
                            loadOrders();
                        },
                        error: function (error) {
                            console.error('Error updating order:', error);
                        }
                    });
                }
            });

            $('#cancel-order-edit-btn').off('click').on('click', function () {
                togglePopup('#order-management-edit-popup', false);
            });
        }
    }

    function handleDeleteOrder(event) {
        event.preventDefault();

        const orderId = $(this).data('id');
        const order = ordersData.find(o => o._id === orderId);

        togglePopup('#order-management-delete-popup', true);


        $('#confirm-delete-order-btn').off('click').on('click', function () {
            $.ajax({
                url: '/order/remove',
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({orderId: order.orderId}),
                success: function () {
                    togglePopup('#order-management-delete-popup', false);
                    togglePopup('#order-management-success-popup', true);
                    loadOrders();
                },
                error: function (error) {
                    togglePopup('#order-management-delete-popup', false);
                    togglePopup('#order-management-error-popup', true);
                    console.error('Error deleting order:', error);
                }
            });
        });


        $('#cancel-delete-order-btn').off('click').on('click', function () {
            togglePopup('#order-management-delete-popup', false);
        });
    }

    function togglePopup(popupId, show = true) {
        const popup = $(popupId);
        popup.css('display', show ? 'flex' : 'none');
        if (!show) {
            popup.find('input').val('');
        }
    }

    function fillOrderForm(order) {
        $('#edit-order-items').val(order.items.join(', '));
        $('#edit-order-total').val(order.total);
    }

    async function validateOrderFormData(orderData) {

        if (!orderData.items || isNaN(orderData.total)) {
            alert('Please fill in all fields correctly.');
            return false;
        }

        const itemsList = orderData.items.split(',').map(item => item.trim());


        for (let itemName of itemsList) {
            const isValid = await validateItemExists(itemName);
            if (!isValid) {
                return false;
            }
        }

        if (orderData.total <= 0) {
            alert('Value must be a positive number');
            return false;
        }

        return true;
    }

    async function validateItemExists(itemName) {
        try {
            const response = await $.ajax({
                url: '/items/get',
                type: 'GET',
                data: {itemName: itemName},
                dataType: 'json'
            });


            if (response.item.quantity > 0) {
                return true;
            } else {
                alert(`Item '${itemName}' is out of stock.`);
                return false;
            }
        } catch (error) {

            if (error.status === 404) {
                alert(`Item '${itemName}' does not exist in the store.`);
            } else {
                alert(`Error fetching item '${itemName}': ${error.responseText || error.statusText}`);
            }
            return false;
        }
    }

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
