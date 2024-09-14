document.addEventListener("DOMContentLoaded", function() {
    let usersData = [];
    let filteredUsers = [];
    let usernameSortOrder = 'asc';
    let roleSortOrder = 'asc';

    // Fetch users from the /users/get-all-users route and display in the table
    fetch('/users/get-all-users')
        .then(response => response.json())
        .then(users => {
            usersData = users; // Store users data for filtering and sorting
            filteredUsers = usersData; // Initially set the filtered data to all users
            renderTable(filteredUsers); // Initial render of the table
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });

    // Populate the role filter dropdown
    fetch('/users/get-user-roles')
        .then(response => response.json())
        .then(roles => {
            populateRoleFilter(roles); // Populate the role filter dropdown with the fetched roles
        })
        .catch(error => {
            console.error('Error fetching roles:', error);
        });

    function populateRoleFilter(roles) {
        const roleFilter = document.getElementById('role-filter');
        roleFilter.innerHTML = '<option value="">All Roles</option>'; // Default option for "All Roles"

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = capitalize(role); // Capitalize the role for display
            roleFilter.appendChild(option);
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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

    // Filter by username
    document.getElementById('search-username').addEventListener('input', function() {
        filterUsers();
    });

    // Filter by role
    document.getElementById('role-filter').addEventListener('change', function() {
        filterUsers();
    });

    // Function to filter users based on search input and role
    function filterUsers() {
        const searchQuery = document.getElementById('search-username').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;

        filteredUsers = usersData.filter(user => {
            const role = user.types.includes('admin') ? 'admin' : 'user';
            const matchesRole = roleFilter ? role === roleFilter : true; // Match the selected role or no filter
            const matchesUsername = user.username.toLowerCase().includes(searchQuery); // Match search query

            return matchesRole && matchesUsername; // Return users that match both criteria
        });

        renderTable(filteredUsers); // Re-render the table with filtered results
    }

    // Function to sort the table and render it
    function sortTable(column, order) {
        if (column === 'username') {
            filteredUsers.sort((a, b) => {
                if (order === 'asc') {
                    return a.username.localeCompare(b.username);
                } else {
                    return b.username.localeCompare(a.username);
                }
            });
            updateArrowIcon('username', order);
        } else if (column === 'role') {
            filteredUsers.sort((a, b) => {
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
        renderTable(filteredUsers); // Re-render the table after sorting
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
            <td>
                <a href="#" class="change-password" data-username="${user.username}">Change Password</a>
                <a href="#" class="delete-user" data-username="${user.username}">Delete</a>
            </td>
        `;
            tableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.change-password').forEach(link => {
            link.addEventListener('click', handleChangePassword);
        });

        document.querySelectorAll('.delete-user').forEach(link => {
            link.addEventListener('click', handleDeleteUser);
        });
    }

    // Function to handle "Change Password"
    function handleChangePassword(event) {
        const username = event.target.getAttribute('data-username');
        const newPassword = prompt(`Enter new password for ${username}`);

        if (newPassword) {
            fetch('/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: newPassword })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'Success') {
                        alert(`Password updated for ${username}`);
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error updating password:', error);
                });
        }
    }

    // Function to handle "Delete User"
    function handleDeleteUser(event) {
        const username = event.target.getAttribute('data-username');

        if (confirm(`Are you sure you want to delete the user: ${username}?`)) {
            fetch('/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'Success') {
                        alert(`${username} has been deleted.`);
                        filterUsers(); // Re-render the table after deletion
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                });
        }
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
