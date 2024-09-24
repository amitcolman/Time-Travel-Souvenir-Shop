$(document).ready(function () {
    $.ajax({
        url: '/order/get-user-orders',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const orderHistoryBody = $('#order-history-body');
            orderHistoryBody.empty();

            
            data.forEach(order => {
                const orderRow = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>
                            <ul>
                                ${order.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </td>
                        <td>${order.total.toFixed(2)}</td>
                    </tr>
                `;
                orderHistoryBody.append(orderRow);
            });
        },
        error: function (error) {
            console.error('Error fetching orders:', error);
        }
    });
});