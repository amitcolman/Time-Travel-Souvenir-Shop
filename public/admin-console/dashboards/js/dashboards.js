$(document).ready(function () {
    
    $.ajax({
        url: '/branches/list',
        method: 'GET',
        success: function (data) {
            $('#total-branches').text(`Total Branches: ${data.branches.length}`);
            data.branches.forEach(function (branch) {
                $('#branch-list').append(`<li>${branch.name} - ${branch.address}</li>`);
            });
        },
        error: function (error) {
            console.error('Error fetching branches:', error);
        }
    });

    
    $.ajax({
        url: '/items/list',
        method: 'GET',
        success: function (data) {
            const periods = { past: 0, present: 0, future: 0 };
            const lowStockItems = [];

            data.item.forEach(function (item) {
                periods[item.period]++;
                if (item.quantity < 10) { 
                    lowStockItems.push(item.itemName);
                }
            });

            
            const ctx = document.getElementById('items-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Past', 'Present', 'Future'],
                    datasets: [{
                        label: 'Items by Period',
                        data: [periods.past, periods.present, periods.future],
                        backgroundColor: ['#f39c12', '#27ae60', '#2980b9']
                    }]
                }
            });

            
            lowStockItems.forEach(function (item) {
                $('#low-stock-list').append(`<li>${item}</li>`);
            });
        },
        error: function (error) {
            console.error('Error fetching items:', error);
        }
    });

    
    $.ajax({
        url: '/users/get-all-users',
        method: 'GET',
        success: function (data) {
            const roles = { admin: 0, user: 0 };
            const latestUsers = [];

            data.forEach(function (user) {
                if (user.types.includes('admin')) {
                    roles.admin++;
                } else {
                    roles.user++;
                }

                
                latestUsers.push(user.username);
            });

            
            const ctx = document.getElementById('users-chart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Admins', 'Users'],
                    datasets: [{
                        data: [roles.admin, roles.user],
                        backgroundColor: ['#f1c40f', '#e74c3c']
                    }]
                }
            });

            
            latestUsers.slice(0, 5).forEach(function (user) {
                $('#latest-users-list').append(`<li>${user}</li>`);
            });
        },
        error: function (error) {
            console.error('Error fetching users:', error);
        }
    });
});
