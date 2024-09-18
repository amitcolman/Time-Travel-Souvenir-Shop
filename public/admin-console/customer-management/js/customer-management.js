$(document).ready(function () {
    let usersData = [];
    let filteredUsers = [];
    let usernameSortOrder = 'asc';
    let roleSortOrder = 'asc';
    const loggedInUsername = 'loggedInUser';

    loadUsers();
    loadRoles();
    loadPopups();

    $('#sort-username').click(() => toggleSort('username'));
    $('#sort-role').click(() => toggleSort('role'));
    $('#search-username').on('input', filterUsers);
    $('#role-filter').change(filterUsers);

    function loadUsers() {
        $.ajax({
            url: '/users/get-all-users',
            type: 'GET',
            dataType: 'json',
            success: function (users) {
                usersData = users;
                filteredUsers = usersData;
                renderTable(filteredUsers);
            },
            error: function (error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    function loadRoles() {
        $.ajax({
            url: '/users/get-user-roles',
            type: 'GET',
            dataType: 'json',
            success: function (roles) {
                populateRoleFilter(roles);
            },
            error: function (error) {
                console.error('Error fetching roles:', error);
            }
        });
    }

    function loadPopups() {
        $.ajax({
            url: '/admin-console/popups.html',
            type: 'GET',
            dataType: 'html',
            success: function (data) {
                $('.popup-container').remove();
                $('body').append(data);
            },
            error: function (error) {
                console.error('Error loading pop-ups:', error);
            }
        });
    }

    function populateRoleFilter(roles) {
        const roleFilter = $('#role-filter');
        roleFilter.empty().append('<option value="">All Roles</option>');
        roles.forEach(role => {
            const option = $('<option></option>').val(role).text(capitalize(role));
            roleFilter.append(option);
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function toggleSort(column) {
        if (column === 'username') {
            usernameSortOrder = usernameSortOrder === 'asc' ? 'desc' : 'asc';
            sortTable('username', usernameSortOrder);
        } else if (column === 'role') {
            roleSortOrder = roleSortOrder === 'asc' ? 'desc' : 'asc';
            sortTable('role', roleSortOrder);
        }
    }

    function sortTable(column, order) {
        const sortFunc = (a, b) => order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);

        if (column === 'username') {
            filteredUsers.sort((a, b) => sortFunc(a.username, b.username));
            updateArrowIcon('username', order);
        } else if (column === 'role') {
            filteredUsers.sort((a, b) => sortFunc(getUserRole(a), getUserRole(b)));
            updateArrowIcon('role', order);
        }

        renderTable(filteredUsers);
    }

    function getUserRole(user) {
        return user.types.includes('admin') ? 'admin' : 'user';
    }

    function updateArrowIcon(column, order) {
        $('#username-arrow, #role-arrow').text('');
        if (column === 'username') {
            $('#username-arrow').text(order === 'asc' ? '▲' : '▼');
        } else if (column === 'role') {
            $('#role-arrow').text(order === 'asc' ? '▲' : '▼');
        }
    }

    function filterUsers() {
        const searchQuery = $('#search-username').val().toLowerCase();
        const roleFilter = $('#role-filter').val();
        filteredUsers = usersData.filter(user => {
            const role = getUserRole(user);
            return (roleFilter ? role === roleFilter : true) && user.username.toLowerCase().includes(searchQuery);
        });
        renderTable(filteredUsers);
    }

    function renderTable(users) {
        const tableBody = $('#userTableBody');
        tableBody.empty();
        users.forEach(user => {
            const role = getUserRole(user);
            let roleAction = '';
            if (role === 'user') {
                roleAction = `<a href="#" class="promote-user" data-username="${user.username}">[Promote to Admin]</a>`;
            } else if (role === 'admin' && user.username !== loggedInUsername) {
                roleAction = `<a href="#" class="demote-user" data-username="${user.username}">[Demote to User]</a>`;
            }

            const row = `
                <tr>
                    <td>${user.username}</td>
                    <td>${role}</td>
                    <td>
                        <a href="#" class="change-password" data-username="${user.username}">[Change Password]</a>
                        <a href="#" class="delete-user" data-username="${user.username}">[Delete]</a>
                        ${roleAction}
                    </td>
                </tr>`;
            tableBody.append(row);
        });

        bindEventListeners();
    }

    function bindEventListeners() {
        $('.promote-user').click(handlePromoteUser);
        $('.demote-user').click(handleDemoteUser);
        $('.change-password').click(handleChangePassword);
        $('.delete-user').click(handleDeleteUser);
    }

    function handlePromoteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');
        $.ajax({
            url: '/users/promote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({username: username}),
            success: function () {
                showRoleChangeSuccessPopup(`User ${username} promoted to admin successfully.`);
                loadUsers();
            },
            error: function (error) {
                showRoleChangeErrorPopup('Error promoting user.');
                console.error('Error promoting user:', error);
            }
        });
    }

    function handleDemoteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');
        $.ajax({
            url: '/users/demote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({username: username}),
            success: function () {
                showRoleChangeSuccessPopup(`User ${username} demoted to user successfully.`);
                loadUsers();
            },
            error: function (error) {
                showRoleChangeErrorPopup('Error demoting user.');
                console.error('Error demoting user:', error);
            }
        });
    }

    function handleDeleteUser(event) {
        event.preventDefault();
        const username = $(this).data('username');
        togglePopup('#delete-confirmation-popup', true);
        $('#confirm-delete-btn').off('click').on('click', function () {
            $.ajax({
                url: '/users/delete',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({username: username}),
                success: function () {
                    togglePopup('#delete-confirmation-popup', false);
                    showDeleteSuccessPopup();
                    loadUsers();
                },
                error: function (error) {
                    togglePopup('#delete-confirmation-popup', false);
                    showDeleteErrorPopup('Error deleting user.');
                    console.error('Error deleting user:', error);
                }
            });
        });
        $('#cancel-delete-btn').off('click').on('click', function () {
            togglePopup('#delete-confirmation-popup', false);
        });
    }

    function handleChangePassword(event) {
        event.preventDefault();
        const username = $(this).data('username');
        togglePopup('#auth-popup', true);
        $('#confirm-auth-btn').off('click').on('click', function () {
            const authPassword = $('#auth-password-input').val();
            if (!authPassword) {
                alert('Please enter a password to authorize.');
                return;
            }
            $.ajax({
                url: '/users/authorize',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({password: authPassword}),
                success: function (response) {
                    if (response.status === 'Success') {
                        togglePopup('#auth-popup', false);
                        showNewPasswordPopup(username);
                    } else {
                        alert('Authorization failed: ' + response.message);
                    }
                },
                error: function (error) {
                    console.error('Error during authorization:', error);
                    alert('Error during authorization.');
                }
            });
        });
        $('#cancel-auth-btn').off('click').on('click', function () {
            togglePopup('#auth-popup', false);
        });
    }
});
