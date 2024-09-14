// Fetch users from the /user/get-all-users route and display in the table
document.addEventListener("DOMContentLoaded", function() {
    fetch('/users/get-all-users')  // Correct route
        .then(response => response.json())
        .then(users => {
            const tableBody = document.getElementById('userTableBody');
            users.forEach(user => {
                const role = user.types.includes('admin') ? 'admin' : 'user';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${role}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
});
