$(document).ready(function () {
    let productsData = [];
    let filteredProducts = [];
    let sortOrder = {
        name: 'asc',
        country: 'asc',
        period: 'asc',
        year: 'asc',
        price: 'asc',
        quantity: 'asc'
    };

    loadProducts();
    loadPopups();

    $('#sort-name').click(() => toggleSort('name'));
    $('#sort-country').click(() => toggleSort('country'));
    $('#sort-period').click(() => toggleSort('period'));
    $('#sort-year').click(() => toggleSort('year'));
    $('#sort-price').click(() => toggleSort('price'));
    $('#sort-quantity').click(() => toggleSort('quantity'));

    $('#search-product').on('input', function () {
        filterProducts();
    });
    $('#period-filter').change(filterProducts);

    function loadProducts() {
        $.ajax({
            url: '/items/list',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (Array.isArray(response.item)) {
                    productsData = response.item;
                    filteredProducts = productsData;
                    renderTable(filteredProducts);
                } else {
                    console.error('Expected an array of products, got:', response.item);
                }
            },
            error: function (error) {
                console.error('Error fetching products:', error);
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
                const relevantPopups = $html.find('#product-management-add-popup, #product-management-edit-popup, ' +
                    '#product-management-delete-popup, #product-management-success-popup, #product-management-error-popup');
                $('body').append(relevantPopups);
                bindClosePopupButtons();
                bindSaveProductButtons();
            },
            error: function (error) {
                console.error('Error loading product management pop-ups:', error);
            }
        });
    }

    function toggleSort(column) {
        for (const key in sortOrder) {
            if (key !== column) {
                sortOrder[key] = 'asc';
            }
        }
        sortOrder[column] = sortOrder[column] === 'asc' ? 'desc' : 'asc';
        sortTable(column, sortOrder[column]);
        updateArrowIcons(column, sortOrder[column]);
    }


    function updateArrowIcons(column, order) {
        $('#name-arrow, #country-arrow, #period-arrow, #year-arrow, #price-arrow, #quantity-arrow').text('');
        const arrow = order === 'asc' ? '▲' : '▼';
        $('#' + column + '-arrow').text(arrow);
    }

    function sortTable(column, order) {
        filteredProducts.sort((a, b) => {
            let valueA, valueB;
            switch (column) {
                case 'name':
                    valueA = a.itemName.toLowerCase();
                    valueB = b.itemName.toLowerCase();
                    break;
                case 'country':
                    valueA = a.country.toLowerCase();
                    valueB = b.country.toLowerCase();
                    break;
                case 'period':
                    valueA = a.period;
                    valueB = b.period;
                    break;
                case 'year':
                    valueA = a.year;
                    valueB = b.year;
                    break;
                case 'price':
                    valueA = a.price;
                    valueB = b.price;
                    break;
                case 'quantity':
                    valueA = a.quantity;
                    valueB = b.quantity;
                    break;
                default:
                    return 0;
            }

            if (order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });


        renderTable(filteredProducts);
    }

    function filterProducts() {
        const searchQuery = $('#search-product').val().toLowerCase();
        filteredProducts = productsData.filter(product => {
            return product.itemName.toLowerCase().includes(searchQuery);
        });
        renderTable(filteredProducts);
    }

    function renderTable(products) {
        const tableBody = $('#productTableBody');
        tableBody.empty();
        products.forEach(product => {
            const row = `
                <tr>
                    <td>${product.itemName}</td>
                    <td>${product.country}</td>
                    <td>${product.period}</td>
                    <td>${product.year}</td>
                    <td>${product.price}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <a href="#" class="edit-product" data-id="${product._id}">[Edit]</a>
                        <a href="#" class="delete-product" data-id="${product._id}">[Delete]</a>
                    </td>
                </tr>`;
            tableBody.append(row);
        });
        bindEventListeners();
    }

    function bindEventListeners() {
        $('.edit-product').click(handleEditProduct);
        $('.delete-product').click(handleDeleteProduct);
        $('#add-product-btn').click(handleAddProduct);
    }

    function bindClosePopupButtons() {
        $('.popup-container .btn').off('click').on('click', function () {
            const popup = $(this).closest('.popup-container');
            popup.css('display', 'none');
        });
    }

    function bindSaveProductButtons() {
        $('#save-new-product-btn').off('click').on('click', function () {
            const productData = getNewProductFormData();
            if (!validateProductFormData(productData)) {
                return;
            }
            $.ajax({
                url: '/items/create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(productData),
                success: function () {
                    togglePopup('#product-management-add-popup', false);
                    loadProducts();
                },
                error: function (error) {
                    console.error('Error saving product:', error);
                    togglePopup('#product-management-error-popup', true);
                }
            });
        });

        $('#save-edit-product-btn').off('click').on('click', function () {
            const newQuantity = $('#edit-product-quantity').val();
            const itemName = $(this).data('itemName');
            if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }

            $.ajax({
                url: '/items/update-quantity',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({itemName: itemName, quantity: newQuantity}),
                success: function () {
                    togglePopup('#product-management-edit-popup', false);
                    loadProducts();
                },
                error: function (error) {
                    console.error('Error updating product quantity:', error);
                }
            });
        });

        $('#confirm-delete-btn').off('click').on('click', function () {
            const itemName = $(this).data('itemName');
            $.ajax({
                url: '/items/delete',
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({itemName: itemName}),
                success: function () {
                    togglePopup('#product-management-delete-popup', false);
                    togglePopup('#product-management-success-popup', true);
                    loadProducts();
                },
                error: function (error) {
                    togglePopup('#product-management-delete-popup', false);
                    togglePopup('#product-management-error-popup', true);
                    console.error('Error deleting product:', error);
                }
            });
        });

        $('#cancel-product-btn').off('click').on('click', function () {
            togglePopup('#product-management-add-popup', false);
            togglePopup('#product-management-edit-popup', false);
        });

        $('#cancel-delete-btn').off('click').on('click', function () {
            togglePopup('#product-management-delete-popup', false);
        });
    }

    function handleAddProduct() {
        togglePopup('#product-management-add-popup', true);
        $('#product-modal-title').text('Add New Product');
        clearProductForm();
    }

    function handleEditProduct(event) {
        event.preventDefault();
        const productId = $(this).data('id');
        const product = productsData.find(p => p._id === productId);
        if (product) {
            togglePopup('#product-management-edit-popup', true);
            $('#product-modal-title').text('Edit Quantity');
            $('#edit-product-quantity').val(product.quantity);
            $('#save-edit-product-btn').data('itemName', product.itemName);
        }
    }

    function handleDeleteProduct(event) {
        event.preventDefault();
        const productId = $(this).data('id');
        const product = productsData.find(p => p._id === productId);
        if (product) {
            togglePopup('#product-management-delete-popup', true);
            $('#confirm-delete-btn').data('itemName', product.itemName);
        }
    }

    function togglePopup(popupId, show = true) {
        const popup = $(popupId);
        popup.css('display', show ? 'flex' : 'none');
        if (!show) {
            popup.find('input').val('');
        }
    }

    function clearProductForm() {
        $('#product-name, #product-country, #product-period, #product-year, #product-price, #product-quantity').val('');
        $('#product-image').val(null);
    }

    function getNewProductFormData() {
        return {
            itemName: $('#add-product-itemName').val(),
            country: $('#add-product-country').val(),
            period: $('#add-product-period').val(),
            year: $('#add-product-year').val(),
            price: $('#add-product-price').val(),
            quantity: $('#add-product-quantity').val(),
            picture: $('#add-product-image-name').val(),
            branch: $('#add-product-branch').val()
        };
    }

    function validateProductFormData(productData) {
        const validBranches = ['Israel', 'Antarctica', 'Chile', 'Mongolia', 'Norway'];
        if (!productData.itemName) {
            alert('Please enter the product name.');
            return false;
        }
        if (!productData.picture) {
            alert('Please enter the image name.');
            return false;
        }
        if (!validBranches.includes(productData.branch)) {
            alert('Please enter a valid branch. Valid branches are: Israel, Antarctica, Chile, Mongolia, Norway.');
            return false;
        }
        if (!productData.price || isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price.');
            return false;
        }
        if (!productData.year || isNaN(productData.year)) {
            alert('Please enter a valid year.');
            return false;
        }
        if (!productData.quantity || isNaN(productData.quantity) || productData.quantity <= 0) {
            alert('Please enter a valid quantity.');
            return false;
        }
        return true;
    }
});
