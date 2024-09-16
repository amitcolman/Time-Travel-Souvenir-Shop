$(document).ready(function() {
    let usersData = [];
    let filteredUsers = [];
    let usernameSortOrder = 'asc';
    let roleSortOrder = 'asc';

    $.ajax({
        url: '/users/get-all-users',
        type: 'GET',
        dataType: 'json',
        success: function(users) {
            usersData = users; // Store users data for filtering and sorting
            filteredUsers = usersData; // Initially set the filtered data to all users
            renderTable(filteredUsers); // Initial render of the table
        },
        error: function(error) {
            console.error('Error fetching users:', error);
        }
    });

    $.ajax({
        url: '/users/get-user-roles',
        type: 'GET',
        dataType: 'json',
        success: function(roles) {
            populateRoleFilter(roles); // Populate the role filter dropdown with the fetched roles
        },
        error: function(error) {
            console.error('Error fetching roles:', error);
        }
    });

    $.ajax({
        url: '/admin-console/popups.html',
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            // Remove any existing popup containers before appending the new one
            $('.popup-container').remove();

            // Append the popups only once
            $('body').append(data);
        },
        error: function(error) {
            console.error('Error loading pop-ups:', error);
        }
    });

    function populateRoleFilter(roles) {
        const roleFilter = $('#role-filter');
        roleFilter.empty().append('<option value="">All Roles</option>'); // Default option for "All Roles"

        roles.forEach(role => {
            const option = $('<option></option>').val(role).text(capitalize(role));
            roleFilter.append(option);
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Sort table by username
    $('#sort-username').click(function() {
        usernameSortOrder = usernameSortOrder === 'asc' ? 'desc' : 'asc';
        sortTable('username', usernameSortOrder);
    });

    // Sort table by role
    $('#sort-role').click(function() {
        roleSortOrder = roleSortOrder === 'asc' ? 'desc' : 'asc';
        sortTable('role', roleSortOrder);
    });

    // Filter by username
    $('#search-username').on('input', function() {
        filterUsers();
    });

    // Filter by role
    $('#role-filter').change(function() {
        filterUsers();
    });

    // Function to filter users based on search input and role
    function filterUsers() {
        const searchQuery = $('#search-username').val().toLowerCase();
        const roleFilter = $('#role-filter').val();

        filteredUsers = usersData.filter(user => {
            const role = user.types.includes('admin') ? 'admin' : 'user';
            const matchesRole = roleFilter ? role === roleFilter : true;
            const matchesUsername = user.username.toLowerCase().includes(searchQuery);

            return matchesRole && matchesUsername;
        });

        renderTable(filteredUsers);
    }

    // Function to sort the table and render it
    function sortTable(column, order) {
        if (column === 'username') {
            filteredUsers.sort((a, b) => {
                return order === 'asc' ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
            });
            updateArrowIcon('username', order);
        } else if (column === 'role') {
            filteredUsers.sort((a, b) => {
                const roleA = a.types.includes('admin') ? 'admin' : 'user';
                const roleB = b.types.includes('admin') ? 'admin' : 'user';
                return order === 'asc' ? roleA.localeCompare(roleB) : roleB.localeCompare(roleA);
            });
            updateArrowIcon('role', order);
        }
        renderTable(filteredUsers);
    }

    // Function to render the table
    function renderTable(users) {
        const tableBody = $('#userTableBody');
        tableBody.empty();  // Clear the table before rendering

        const loggedInUsername = 'loggedInUser'; // Replace this with the actual logged-in user's username (from session or global var)

        users.forEach(user => {
            const role = user.types.includes('admin') ? 'admin' : 'user';
            let roleAction = '';

            // Check if the user can be promoted or demoted
            if (role === 'user') {
                roleAction = `<a href="#" class="promote-user" data-username="${user.username}">[Promote to Admin]</a>`;
            } else if (role === 'admin' && user.username !== loggedInUsername) {
                roleAction = `<a href="#" class="demote-user" data-username="${user.username}">[Demote to User]</a>`;
            }

            // Render the row with square brackets around each link text
            const row = `
            <tr>
                <td>${user.username}</td>
                <td>${role}</td>
                <td>
                    <a href="#" class="change-password" data-username="${user.username}">[Change Password]</a>
                    <a href="#" class="delete-user" data-username="${user.username}">[Delete]</a>
                    ${roleAction}
                </td>
            </tr>
        `;
            tableBody.append(row);
        });

        // Add event listeners for the new promote/demote buttons
        $('.promote-user').click(handlePromoteUser);
        $('.demote-user').click(handleDemoteUser);

        // Add event listeners for existing actions
        $('.change-password').click(handleChangePassword);
        $('.delete-user').click(handleDeleteUser);
    }


    // Handle Change Password
    function handleChangePassword(event) {
        event.preventDefault();
        const username = $(this).data('username');
        const authPopup = $('#auth-popup');

        // Ensure popup is displayed with flexbox alignment
        authPopup.css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        $('#confirm-auth-btn').off('click').on('click', function() {
            const authPassword = $('#auth-password-input').val();

            $.ajax({
                url: '/users/authorize',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ password: authPassword }),
                success: function(data) {
                    if (data.status === 'Success') {
                        authPopup.hide();
                        authPopup.find('#auth-password-input').val('');
                        showNewPasswordPopup(username);
                    } else {
                        alert('Authorization failed: ' + data.message);
                    }
                },
                error: function(error) {
                    console.error('Error during authorization:', error);
                    alert('Error during authorization');
                }
            });
        });

        $('#cancel-auth-btn').click(function() {
            authPopup.hide();
            authPopup.find('#auth-password-input').val('');
        });
    }

    // Show new password pop-up
    function showNewPasswordPopup(username) {
        const newPasswordPopup = $('#change-password-popup');

        // Apply CSS to ensure the popup is centered
        newPasswordPopup.css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        $('#confirm-change-password-btn').off('click').on('click', function() {
            const newPassword = $('#new-password-input').val();

            if (!isPasswordValid(newPassword)) {
                newPasswordPopup.css('display', 'none');
                showPasswordPolicyError();
                return;
            }

            $.ajax({
                url: '/users/update-password',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: username, password: newPassword }),
                success: function(data) {
                    if (data.status === 'Success') {
                        newPasswordPopup.css('display', 'none');
                        showChangeSuccessPopup();
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                },
                error: function(error) {
                    console.error('Error updating password:', error);
                }
            });
        });

        $('#cancel-change-password-btn').on('click', function() {
            newPasswordPopup.css('display', 'none');
            newPasswordPopup.find('#new-password-input').val('');
        });
    }

    // Handle "Delete User"
    function handleDeleteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');
        const authPopup = $('#auth-popup');

        // Apply CSS to ensure the popup is centered
        authPopup.css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        $('#confirm-auth-btn').off('click').on('click', function() {
            const password = $('#auth-password-input').val();

            $.ajax({
                url: '/users/delete',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: username, password: password }),
                success: function(data) {
                    if (data.status === 'Success') {
                        showDeleteSuccessPopup();
                        refreshUsers();
                    } else {
                        showDeleteErrorPopup(data.message);
                    }
                },
                error: function() {
                    showDeleteErrorPopup('An unexpected error occurred');
                }
            });

            authPopup.hide();
            authPopup.find('#auth-password-input').val('');
        });

        $('#cancel-auth-btn').click(function() {
            authPopup.hide();
            authPopup.find('#auth-password-input').val('');
        });
    }

    // Fetch and render updated users
    function refreshUsers() {
        $.ajax({
            url: '/users/get-all-users',
            type: 'GET',
            dataType: 'json',
            success: function(users) {
                renderTable(users);
            },
            error: function(error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    // Function to update the arrow icon next to the column name
    function updateArrowIcon(column, order) {
        $('#username-arrow').text('');
        $('#role-arrow').text('');

        if (column === 'username') {
            $('#username-arrow').text(order === 'asc' ? '▲' : '▼');
        } else if (column === 'role') {
            $('#role-arrow').text(order === 'asc' ? '▲' : '▼');
        }
    }

    // Show the user deletion success popup
    function showDeleteSuccessPopup() {
        const successPopup = $('#delete-success-popup');
        successPopup.css({
            'display': 'flex',
            'width': '100vw',
            'height': '100vh',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // Add event listener to close button
        $('#close-delete-success-btn').on('click', function () {
            successPopup.css('display', 'none');
        });
    }

    // Show the user deletion error popup with a custom error message
    function showDeleteErrorPopup(errorMessage) {
        const errorPopup = $('#delete-error-popup');
        const errorMsg = $('#delete-error-message');

        // Set the error message
        errorMsg.text(errorMessage);

        errorPopup.css({
            'display': 'flex',
            'width': '100vw',
            'height': '100vh',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // Add event listener to close button
        $('#close-delete-error-btn').on('click', function () {
            errorPopup.css('display', 'none');
        });
    }

    // Show password policy error popup
    function showPasswordPolicyError() {
        const policyErrorPopup = $('#password-policy-error-popup');

        policyErrorPopup.css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // Add event listener to close button
        $('#close-policy-error-btn').on('click', function () {
            policyErrorPopup.css('display', 'none');
        });
    }

    // Check if the password meets the policy (example: minimum 8 and maximum 16 characters)
    function isPasswordValid(password) {
        return password.length >= 8 && password.length <= 16;
    }

    function showChangeSuccessPopup() {
        $('.popup-container').css('display', 'none');

        const successPopup = $('#password-success-popup');

        // Ensure the password success popup is displayed
        successPopup.closest('.popup-container').css({
            'display': 'flex',
            'width': '100vw',
            'height': '100vh',
            'justify-content': 'center',
            'align-items': 'center'
        });

        // Add event listener to close button
        $('#close-success-btn').off('click').on('click', function () {
            successPopup.closest('.popup-container').css('display', 'none');
        });
    }

    function handlePromoteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');

        $.ajax({
            url: '/users/promote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username }),
            success: function() {
                showRoleChangeSuccessPopup(`User ${username} promoted to admin successfully.`);
                refreshUsers();
            },
            error: function(error) {
                showRoleChangeErrorPopup('Error promoting user.');
                console.error('Error promoting user:', error);
            }
        });
    }

    // Handle demoting a user to regular user
    function handleDemoteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');

        $.ajax({
            url: '/users/demote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username }),
            success: function() {
                showRoleChangeSuccessPopup(`User ${username} demoted to user successfully.`);
                refreshUsers();
            },
            error: function(error) {
                showRoleChangeErrorPopup('Error demoting user.');
                console.error('Error demoting user:', error);
            }
        });
    }

    // Show success popup
    function showRoleChangeSuccessPopup(message) {
        $('#role-change-success-message').text(message);  // Set the success message
        $('#role-change-success-popup').css('display', 'flex'); 

        // Close button event listener
        $('#close-role-change-success-btn').off('click').on('click', function() {
            $('#role-change-success-popup').css('display', 'none'); 
        });
    }

// Show error popup
    function showRoleChangeErrorPopup(message) {
        $('#role-change-error-message').text(message);  // Set the error message
        $('#role-change-error-popup').css('display', 'flex'); 

        // Close button event listener
        $('#close-role-change-error-btn').off('click').on('click', function() {
            $('#role-change-error-popup').css('display', 'none'); 
        });
    }

});

