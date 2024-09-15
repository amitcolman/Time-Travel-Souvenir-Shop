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

    fetch('/admin-console/popups.html') // Make sure the path is correct
        .then(response => response.text())
        .then(data => {
            // Insert the pop-up HTML into the body or a specific container
            const div = document.createElement('div');
            div.innerHTML = data;
            document.body.appendChild(div); // You can append it to body or a specific element
        })
        .catch(error => console.error('Error loading pop-ups:', error));

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

    // Handle Change Password
    function handleChangePassword(event) {
        const username = event.target.getAttribute('data-username');

        // Show the authorization pop-up
        const authPopup = document.getElementById('auth-popup');
        authPopup.style.display = 'flex'; // Show the auth pop-up

        // Confirm authorization button
        const confirmAuthBtn = document.getElementById('confirm-auth-btn');
        const cancelAuthBtn = document.getElementById('cancel-auth-btn');
        const authPasswordInput = document.getElementById('auth-password-input');

        // Handle authorization
        confirmAuthBtn.onclick = function() {
            const authPassword = authPasswordInput.value;

            // Fetch the authorization route
            fetch('/users/authorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: authPassword })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'Success') {
                        // Authorization successful, prompt for new password
                        authPopup.style.display = 'none'; // Hide authorization pop-up
                        showNewPasswordPopup(username);
                    } else {
                        alert('Authorization failed: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error during authorization:', error);
                    alert('Error during authorization');
                });
        };

        // Handle cancel authorization button
        cancelAuthBtn.onclick = function() {
            authPopup.style.display = 'none'; // Hide the authorization pop-up
        };
    }

    // Show new password pop-up
    function showNewPasswordPopup(username) {
        const newPasswordPopup = document.getElementById('change-password-popup');
        newPasswordPopup.style.display = 'flex'; // Show the new password pop-up

        const confirmChangePasswordBtn = document.getElementById('confirm-change-password-btn');
        const cancelChangePasswordBtn = document.getElementById('cancel-change-password-btn');
        const newPasswordInput = document.getElementById('new-password-input');

        // Handle password change
        confirmChangePasswordBtn.onclick = function() {
            const newPassword = newPasswordInput.value;

            // Simulate password policy check
            if (!isPasswordValid(newPassword)) {
                newPasswordPopup.style.display = 'none'; // Hide the new password pop-up
                showPasswordPolicyError(); // Show password policy error pop-up
                return;
            }

            fetch('/users/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: newPassword })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'Success') {
                        newPasswordPopup.style.display = 'none'; // Hide the new password pop-up
                        showChangeSuccessPopup(); // Show success pop-up
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error updating password:', error);
                });
        };

        cancelChangePasswordBtn.onclick = function() {
            newPasswordPopup.style.display = 'none'; // Hide the new password pop-up
        };
    }

    // Password policy validation (dummy function)
    function isPasswordValid(password) {
        return password.length >= 8 && password.length <= 16; // Example: password must be 8-16 characters long
    }

    // Show password policy error pop-up
    function showPasswordPolicyError() {
        const policyErrorPopup = document.getElementById('password-policy-error-popup');
        policyErrorPopup.style.display = 'flex'; // Show the password policy error pop-up

        const closePolicyErrorBtn = document.getElementById('close-policy-error-btn');
        closePolicyErrorBtn.onclick = function() {
            policyErrorPopup.style.display = 'none'; // Hide the error pop-up
        };
    }

    // Show success pop-up
    function showChangeSuccessPopup() {
        const successPopup = document.getElementById('password-success-popup');
        successPopup.style.display = 'flex'; // Show the success pop-up

        const closeSuccessBtn = document.getElementById('close-success-btn');
        closeSuccessBtn.onclick = function() {
            successPopup.style.display = 'none'; // Hide the success pop-up
        };
    }

    // Function to handle "Delete User"
    function handleDeleteUser(event) {
        const username = event.target.getAttribute('data-username');  // User to be deleted

        // Show the authorization pop-up (reuse for password validation)
        const authPopup = document.getElementById('auth-popup');
        authPopup.style.display = 'flex'; // Show the authorization pop-up

        // Confirm authorization button
        const confirmAuthBtn = document.getElementById('confirm-auth-btn');
        const cancelAuthBtn = document.getElementById('cancel-auth-btn');
        const authPasswordInput = document.getElementById('auth-password-input');  // Password input for logged-in user

        // Handle authorization
        confirmAuthBtn.onclick = function() {
            const password = authPasswordInput.value;  // Get the logged-in user's password

            // Send a delete request with the logged-in user's password for authorization
            fetch('/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: password })  // Send the target username and logged-in user's password
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'Success') {
                        showDeleteSuccessPopup();  // Show success pop-up

                        // Fetch updated user list and re-render the table
                        fetch('/users/get-all-users')
                            .then(response => response.json())
                            .then(users => {
                                renderTable(users);  // Re-render the table with updated user list
                            })
                            .catch(error => console.error('Error fetching users:', error));
                    } else {
                        showDeleteErrorPopup(data.message);  // Show error pop-up with the error message
                    }
                })
                .catch(error => {
                    showDeleteErrorPopup('An unexpected error occurred');  // Show a generic error pop-up if something went wrong
                });

            authPopup.style.display = 'none';  // Hide the authorization pop-up after confirmation
        };

        // Handle cancel button
        cancelAuthBtn.onclick = function() {
            authPopup.style.display = 'none';  // Hide the authorization pop-up if canceled
        };
    }

// Show the user deletion success pop-up
    function showDeleteSuccessPopup() {
        const successPopup = document.getElementById('delete-success-popup');
        successPopup.style.display = 'flex'; // Show success pop-up

        const closeSuccessBtn = document.getElementById('close-delete-success-btn');
        closeSuccessBtn.onclick = function() {
            successPopup.style.display = 'none'; // Hide the success pop-up when closed
        };
    }

// Show the user deletion error pop-up with a custom error message
    function showDeleteErrorPopup(errorMessage) {
        const errorPopup = document.getElementById('delete-error-popup');
        const errorMsg = document.getElementById('delete-error-message');
        errorMsg.textContent = errorMessage; // Set the error message
        errorPopup.style.display = 'flex'; // Show error pop-up

        const closeErrorBtn = document.getElementById('close-delete-error-btn');
        closeErrorBtn.onclick = function() {
            errorPopup.style.display = 'none'; // Hide the error pop-up when closed
        };
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
