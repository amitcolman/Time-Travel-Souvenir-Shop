document.addEventListener("DOMContentLoaded", function() {
    let usersData = [];
    let filteredUsers = [];
    let usernameSortOrder = 'asc';
    let roleSortOrder = 'asc';
    let authorizedUsername = null;  // Track authorized user for password change

    // Fetch users from the API
    fetchUsers();

    // Fetch and populate the role filter dropdown
    fetchRoles();

    // Fetch and load pop-ups from the HTML file
    loadPopups();

    // Function to fetch users
    function fetchUsers() {
        $.ajax({
            url: '/users/get-all-users',
            method: 'GET',
            success: function(users) {
                usersData = users;
                filteredUsers = users;
                renderTable(filteredUsers);
            },
            error: function(error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    // Function to fetch roles
    function fetchRoles() {
        $.ajax({
            url: '/users/get-user-roles',
            method: 'GET',
            success: function(roles) {
                populateRoleFilter(roles);
            },
            error: function(error) {
                console.error('Error fetching roles:', error);
            }
        });
    }

    // Function to load pop-ups from HTML
    function loadPopups() {
        $.ajax({
            url: '/admin-console/popups.html',  // Correct URL for popups
            method: 'GET',
            success: function(html) {
                $('body').append(html);

                // Attach the event listener for the change password button after the popups are loaded
                attachEventListeners(); // Attach event listeners after pop-ups are loaded
            },
            error: function(error) {
                console.error('Error loading popups:', error);
            }
        });
    }

    function attachEventListeners() {
        // Handle closing popups
        const closeButtons = [
            { id: 'close-success-btn', popupId: 'password-success-popup' },
            { id: 'close-policy-error-btn', popupId: 'password-policy-error-popup' },
            { id: 'close-delete-success-btn', popupId: 'delete-success-popup' },
            { id: 'close-delete-error-btn', popupId: 'delete-error-popup' },
            { id: 'cancel-delete-btn', popupId: 'delete-confirmation-popup' },
            { id: 'cancel-change-password-btn', popupId: 'change-password-popup' },
            { id: 'cancel-auth-btn', popupId: 'auth-popup' }
        ];

        // Loop through each close button and attach the event listener
        closeButtons.forEach(button => {
            const closeButton = document.getElementById(button.id);
            if (closeButton) {
                closeButton.onclick = function() {
                    togglePopup(button.popupId, false);  // Hide the respective popup
                };
            } else {
                console.error(`${button.id} not found`);
            }
        });

        // Attach event listeners for the confirm actions
        const confirmChangePasswordBtn = document.getElementById('confirm-change-password-btn');
        if (confirmChangePasswordBtn) {
            confirmChangePasswordBtn.onclick = function() {
                const newPassword = document.getElementById('new-password-input').value;

                if (!validatePassword(newPassword)) {
                    togglePopup('password-policy-error-popup', true);  // Show password policy error
                    return;
                }

                // Send password update request
                $.ajax({
                    url: '/users/update-password',
                    method: 'POST',
                    data: { username: authorizedUsername, password: newPassword },
                    success: function(response) {
                        togglePopup('change-password-popup', false);  // Hide change-password pop-up
                        if (response.status === 'Success') {
                            togglePopup('password-success-popup', true);  // Show success pop-up
                        } else {
                            displayErrorMessage(response.message);
                        }
                    },
                    error: function(error) {
                        console.error('Error updating password:', error);
                        displayErrorMessage('Error updating password.');
                    }
                });
            };
        }
    }

    // Function to render the table with user data
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

        // Use event delegation for dynamically added elements
        document.getElementById('userTableBody').addEventListener('click', function(e) {
            if (e.target.classList.contains('change-password')) {
                handleChangePassword(e);
            } else if (e.target.classList.contains('delete-user')) {
                handleDeleteUser(e);
            }
        });
    }

    // Generic function to toggle pop-ups
    function togglePopup(popupId, show) {
        const popup = document.getElementById(popupId);
        popup.style.display = show ? 'flex' : 'none';
    }

    // Improved password validation function
    function validatePassword(password) {
        const minLength = 8;
        const maxLength = 16;
        return password.length >= minLength && password.length <= maxLength;
    }

    // Handle password change event
    function handleChangePassword(event) {
        authorizedUsername = event.target.getAttribute('data-username');
        togglePopup('auth-popup', true);  // Show authorization pop-up

        const confirmAuthBtn = document.getElementById('confirm-auth-btn');
        const authPasswordInput = document.getElementById('auth-password-input');

        confirmAuthBtn.onclick = function() {
            const password = authPasswordInput.value;

            // Authorize the user
            $.ajax({
                url: '/users/authorize',
                method: 'POST',
                data: { password: password },
                success: function(response) {
                    if (response.status === 'Success') {
                        togglePopup('auth-popup', false);  // Hide authorization pop-up
                        togglePopup('change-password-popup', true);  // Show change-password popup
                    } else {
                        togglePopup('auth-popup', false);  // Hide authorization pop-up
                        displayErrorMessage(response.message);
                    }
                },
                error: function(error) {
                    console.error('Error during authorization:', error);
                    togglePopup('auth-popup', false);  // Hide authorization pop-up
                    displayErrorMessage('Error during authorization.');
                }
            });
        };

        // Handle confirming password change after authorization
        const confirmChangePasswordBtn = document.getElementById('confirm-change-password-btn');
        confirmChangePasswordBtn.onclick = function() {
            const newPassword = document.getElementById('new-password-input').value;

            if (!validatePassword(newPassword)) {
                togglePopup('password-policy-error-popup', true);  // Show password policy error
                return;
            }

            // Send password update request
            $.ajax({
                url: '/users/update-password',
                method: 'POST',
                data: { username: authorizedUsername, password: newPassword },
                success: function(response) {
                    togglePopup('change-password-popup', false);  // Hide change-password pop-up
                    if (response.status === 'Success') {
                        togglePopup('password-success-popup', true);  // Show success pop-up
                    } else {
                        displayErrorMessage(response.message);
                    }
                },
                error: function(error) {
                    console.error('Error updating password:', error);
                    displayErrorMessage('Error updating password.');
                }
            });
        };
    }

    // Handle delete user event
    function handleDeleteUser(event) {
        const username = event.target.getAttribute('data-username');
        togglePopup('delete-confirmation-popup', true);  // Show delete confirmation pop-up

        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

        confirmDeleteBtn.onclick = function() {
            $.ajax({
                url: '/users/delete',
                method: 'POST',
                data: { username },
                success: function(response) {
                    togglePopup('delete-confirmation-popup', false);  // Hide delete confirmation pop-up
                    if (response.status === 'Success') {
                        fetchUsers();  // Re-fetch users and update table
                        togglePopup('delete-success-popup', true);  // Show delete success pop-up
                    } else {
                        document.getElementById('delete-error-message').textContent = response.message;
                        togglePopup('delete-error-popup', true);  // Show delete error pop-up
                    }
                },
                error: function(error) {
                    console.error('Error deleting user:', error);
                    document.getElementById('delete-error-message').textContent = 'Error deleting user.';
                    togglePopup('delete-error-popup', true);  // Show delete error pop-up
                }
            });
        };

        cancelDeleteBtn.onclick = function() {
            togglePopup('delete-confirmation-popup', false);  // Hide delete confirmation pop-up
        };
    }

    // Function to populate the role filter dropdown
    function populateRoleFilter(roles) {
        const roleFilter = document.getElementById('role-filter');
        roleFilter.innerHTML = '<option value="all">All Roles</option>'; // Default option
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleFilter.appendChild(option);
        });

        // Filter users based on the selected role
        roleFilter.onchange = function() {
            const selectedRole = roleFilter.value;
            if (selectedRole === 'all') {
                filteredUsers = usersData;
            } else if (selectedRole === 'user') {
                // Only include users that have "user" as their only role
                filteredUsers = usersData.filter(user => user.types.length === 1 && user.types[0] === 'user');
            } else {
                // Filter users that have the selected role in their types array (for "admin")
                filteredUsers = usersData.filter(user => user.types.includes(selectedRole));
            }
            renderTable(filteredUsers);
        };
    }

    // Add sorting functionality for username and role columns
    $('#username-column').on('click', function() {
        sortUsersBy('username', usernameSortOrder);
        usernameSortOrder = usernameSortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
    });

    $('#role-column').on('click', function() {
        sortUsersBy('role', roleSortOrder);
        roleSortOrder = roleSortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
    });

    // Function to sort users by column
    function sortUsersBy(column, sortOrder) {
        filteredUsers.sort((a, b) => {
            if (column === 'username') {
                return sortOrder === 'asc' ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
            } else if (column === 'role') {
                const roleA = a.types.includes('admin') ? 'admin' : 'user';
                const roleB = b.types.includes('admin') ? 'admin' : 'user';
                return sortOrder === 'asc' ? roleA.localeCompare(roleB) : roleB.localeCompare(roleA);
            }
        });
        renderTable(filteredUsers); // Re-render the table with sorted data
    }

    // Generic function to display error messages
    function displayErrorMessage(message) {
        const errorMsg = document.getElementById('error-message');
        errorMsg.textContent = message;
        togglePopup('error-popup', true);

        // Automatically hide the error popup after 3 seconds
        setTimeout(() => {
            togglePopup('error-popup', false);
        }, 3000);
    }
});
