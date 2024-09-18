$(document).ready(function() {
    const onThisDayElement = $('.onThisDay');
    $.ajax({
        url: '/wiki/onthisday',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data && data.text && data.year) {
                const eventHTML = `
                    <div class="card text-center shadow-sm mt-4">
                        <div class="card-body">
                            <h5 class="card-title">On This Day (${data.year}):</h5>
                            <p class="card-text">${data.text}</p>
                            ${data.imageUrl ? `<div><img src="${data.imageUrl}" class="img-fluid mb-3 w-1 h-auto"></div>` : ''}
                            ${data.pageUrl ? `<a href="${data.pageUrl}" target="_blank" class="btn btn-primary">Read More on Wikipedia</a>` : ''}
                        </div>
                    </div>
                `;

                onThisDayElement.html(eventHTML);
            } else {
                onThisDayElement.html('<p>No events found for today.</p>');
            }
        },
        error: function(error) {
            console.error('Error fetching On This Day data:', error);
            onThisDayElement.html('<p>No events found for today.</p>');
        }
    });
});
