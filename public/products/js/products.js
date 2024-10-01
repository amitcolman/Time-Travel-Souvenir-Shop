
let filterMinPrice = 0;
let filterMaxPrice = 0;
let products = $('#items-list')


function renderCountries(){
    $.ajax({
        url: `/items/countries`,
        method: 'GET',
        success: function(data) {
            data.countries.forEach(country => {
                $('#country').append(`<option value="${country}">${country}</option>`);
            });
        },
        error: function(error) {
            console.error('Error fetching countries', error);
        }
    });
}


function getYears(yearRange) {
    let minYear = null
    let maxYear = null
    switch (yearRange) {
        case 'before_0':
            maxYear = -1;
            break;
        case '0_1800':
            minYear = 0;
            maxYear = 1800;
            break;
        case '1801_2000':
            minYear = 1801;
            maxYear = 2000;
            break;
        case '2001_2024':
            minYear = 2001;
            maxYear = 2024;
            break;
        case 'after_2024':
            minYear = 2025;
            break;
    }
    return [minYear, maxYear];
}


function renderPriceRange(){
    let minPrice = 1
    let maxPrice = 10000
    $.ajax({
        url: `/items/price-range`,
        method: 'GET',
        success: function(data) {
            minPrice = data.minPrice;
            maxPrice = data.maxPrice;
        },
        error: function(error) {
            console.log('Error fetching items - using default min and max', error);
        }
    }).always(function() {
        $("#priceRange").slider({
            range: true,
            min: minPrice,
            max: maxPrice,
            values: [minPrice, maxPrice],
            slide: function (event, ui) {
                $("#priceLabel").text(`${ui.values[0]}₪ - ${ui.values[1]}₪`);

                filterMinPrice = ui.values[0];
                filterMaxPrice = ui.values[1];
            }
        });
        $("#priceLabel").text(`${minPrice}₪ - ${maxPrice}₪`);
        filterMinPrice = minPrice;
        filterMaxPrice = maxPrice;
    });
}


function applyFilters() {
    const period = $('#period').val();
    const minPrice = filterMinPrice;
    const maxPrice = filterMaxPrice;
    const country = $('#country').val();
    const years = getYears($('#year').val())
    const minYear = years[0];
    const maxYear = years[1];

    const filters = {};


    if (period && period !== 'all') filters.period = period;
    if (minYear) filters.minYear = minYear;
    if (maxYear) filters.minYear = maxYear;
    if (country && country !== 'all') filters.country = country;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    console.log('Filters:', filters);
    fetchItems(filters)
}


function fetchItems(filters = {}) {
    const queryParams = $.param(filters);
    const url = `/items/list${queryParams ? `?${queryParams}` : ''}`;
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            renderItems(data.item);
        },
        error: function(error) {
            console.error('Error fetching items', error);
            products.html('<p>Error loading items. Please try again later.</p>');
        }
    });
}


function renderItems(items) {
    products.empty()
    let itemsHtml = items.map(item => {
        let isOutOfStock = item.quantity < 1;
        return `
        <div class="item-card col-md-4">
            <img src="img/${item.picture}" class="card-img-top ${isOutOfStock ? 'out-of-stock-img' : ''}" alt="${item.itemName}">
            <div class="card-body">
                <h5 class="item-name">${item.itemName} ${isOutOfStock ? '(Out of Stock)' : ''}</h5>
                <p class="item-price">${item.price.toFixed(2)}₪</p>
                <button class="btn ${isOutOfStock ? 'btn-disabled' : 'btn-success'} add-to-cart-btn" data-item-name="${item.itemName}" ${isOutOfStock ? 'Out of stock' : ''}>${isOutOfStock ? 'Unavailable' : 'Add to Cart'}</button>
            </div>
        </div>`;
    }).join('');

    products.append(itemsHtml);
}


function fetchItemDetails(itemName) {
    $.ajax({
        url: `/items/get?itemName=${itemName}`,
        method: 'GET',
        success: function(item) {
            showItemDetails(item.item);
        },
        error: function(error) {
            console.error('Error fetching item details', error);
            alert('Error loading item details. Please try again later.');
        }
    });
}


function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} BC` : year;
}


function showItemDetails(item) {
    let itemDetailsHtml = `
    <img src="img/${item.picture}" class="img-fluid mb-3" alt="${item.itemName}">
    <h4>${item.itemName}</h4>
    <p>Country: ${item.country}</p>
    <p>Period: ${item.period} (${formatYear(item.year)})</p>
    <p>Price: ${item.price.toFixed(2)}₪</p>
`;

    $('#item-details').html(itemDetailsHtml);
    $('#add-to-cart-modal').data('data-item-name', item.itemName);
    let modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();

}


function addToCart(itemName, buttonElement){
    $.ajax({
        url: `/cart/add`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"itemName":itemName}),
        success: function() {
            $(buttonElement).text('Item added to cart')
            $(buttonElement).removeClass('btn-success').addClass('btn-added')
            $(buttonElement).prop('disabled', true);
        },
        error: function(error) {
            if (error.status === 403) {
                $(buttonElement).text('Log in to add to cart');
                $(buttonElement).removeClass('btn-success').addClass('btn-error');
            } else if (error.status === 400) {
                $(buttonElement).text('Item already in cart');
                $(buttonElement).removeClass('btn-success').addClass('btn-error');
            } else {
                $(buttonElement).text('Failed to add to cart. Please can try again later.');
                $(buttonElement).removeClass('btn-success').addClass('btn-error');
            }
            $(buttonElement).prop('disabled', true);

            setTimeout(function() {
                $(buttonElement).text('Add to Cart');
                $(buttonElement).removeClass('btn-error').addClass('btn-success');
                $(buttonElement).prop('disabled', false);
            }, 5000);
        }
    });
}

products.on('click', '.item-card img', function () {
    let itemName = $(this).attr('alt');
    fetchItemDetails(itemName);
});

products.on('click', '.add-to-cart-btn', function () {
    const itemName = $(this).data('itemName');
    addToCart(itemName, this);
});


$(document).ready(function() {
    renderCountries()
    renderPriceRange()
    fetchItems();
});