document.addEventListener("DOMContentLoaded", function() {
    let usersData = [];
    let usernameSortOrder = 'asc';
    let roleSortOrder = 'asc';

    // Fetch users from the /users/get-all-users route and display in the table
    fetch('/users/get-all-users')
        .then(response => response.json())
        .then(users => {
            usersData = users; // Store users data for sorting later
            renderTable(usersData); // Initial render of the table
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });

    // Sort table by username
    document.getElementById('sort-username').addEventListener('click', function() {
        usernameSortOrder = usernameSortOrder === 'asc' ? 'desc' : 'asc';
        sortTable('username', usernameSortOrder);
    });

    // Sort table by role
    document.getElementById('sort-role').addEventListener('click', function() {
        roleSortOrder = roleSortOrder === 'asc' ? 'desc' : 'asc';
        sortTable('role', roleSortOrder);
    });

    // Function to sort the table and render it
    function sortTable(column, order) {
        if (column === 'username') {
            usersData.sort((a, b) => {
                if (order === 'asc') {
                    return a.username.localeCompare(b.username);
                } else {
                    return b.username.localeCompare(a.username);
                }
            });
            updateArrowIcon('username', order);
        } else if (column === 'role') {
            usersData.sort((a, b) => {
                const roleA = a.types.includes('admin') ? 'admin' : 'user';
                const roleB = b.types.includes('admin') ? 'admin' : 'user';
                if (order === 'asc') {
                    return roleA.localeCompare(roleB);
                } else {
                    return roleB.localeCompare(roleA);
                }
            });
            updateArrowIcon('role', order);
        }
        renderTable(usersData); // Re-render the table after sorting
    }

    // Function to render the table
    function renderTable(users) {
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = ''; // Clear the table before rendering
        users.forEach(user => {
            const role = user.types.includes('admin') ? 'admin' : 'user';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${role}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to update the arrow icon next to the column name
    function updateArrowIcon(column, order) {
        const usernameArrow = document.getElementById('username-arrow');
        const roleArrow = document.getElementById('role-arrow');

        // Reset arrow icons
        usernameArrow.textContent = '';
        roleArrow.textContent = '';

        // Update the correct arrow icon
        if (column === 'username') {
            usernameArrow.textContent = order === 'asc' ? '▲' : '▼';
        } else if (column === 'role') {
            roleArrow.textContent = order === 'asc' ? '▲' : '▼';
        }
    }
});
