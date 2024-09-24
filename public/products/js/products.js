
let REMOTE_URL = 'http://localhost:3000';
let filterMinPrice = 0;
let filterMaxPrice = 0;


function renderCountries(){
    $.ajax({
        url: `${REMOTE_URL}/items/countries`,
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
        url: `${REMOTE_URL}/items/price-range`,
        method: 'GET',
        success: function(data) {
            minPrice = data.minPrice;
            maxPrice = data.maxPrice;
        },
        error: function(error) {
            console.log('Error fetching items - using default min and max', error);
        }
    });
    $("#priceRange").slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function(event, ui) {
            $("#priceLabel").text(`${ui.values[0]}₪ - ${ui.values[1]}₪`);

            filterMinPrice = ui.values[0];
            filterMaxPrice = ui.values[1];
        }
    });
    $("#priceLabel").text(`${minPrice}₪ - ${maxPrice}₪`);
    filterMinPrice = minPrice;
    filterMaxPrice = maxPrice;
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


function toggleFilter() {
    $('#filterContainer').collapse('toggle');
}


function fetchItems(filters = {}) {
    const queryParams = $.param(filters);
    const url = `${REMOTE_URL}/items/list${queryParams ? `?${queryParams}` : ''}`;
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            renderItems(data.item);  
        },
        error: function(error) {
            console.error('Error fetching items', error);
            $('#items-list').html('<p>Error loading items. Please try again later.</p>');
        }
    });
}



function renderItems(items) {
    $('#items-list').empty()
    let itemsHtml = items.map(item => `
    <div class="col-md-4 mb-3">
        <div class="item-card" data-item-name="${item.itemName}">
            <img src="img/${item.picture}" class="card-img-top" alt="${item.itemName}">
            <div class="card-body">
                <h5 class="item-name">${item.itemName}</h5>
                 <p class="item-price">${item.price.toFixed(2)}₪</p>
                <button class="btn btn-success add-to-cart-btn" data-item-name="${item.itemName}">Add to Cart</button>
            </div>
        </div>
    </div>`
    ).join('');

    $('#items-list').append(itemsHtml);
}


function fetchItemDetails(itemName) {
    $.ajax({
        url: `${REMOTE_URL}/items/get?itemName=${itemName}`,  
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
    $('#add-to-cart-modal').data('item-name', item.itemName);
    let modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();

}


$('#items-list').on('click', '.item-card', function () {
    let itemName = $(this).data('itemName');
    fetchItemDetails(itemName);
});



$(document).ready(function() {
    renderCountries()
    renderPriceRange()
    fetchItems();
});