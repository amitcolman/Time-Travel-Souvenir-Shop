
function togglePopup(popupId, show = true) {
    const popup = $(popupId);
    popup.css('display', show ? 'flex' : 'none');
    popup.find('input').val(''); 
}


function showDeleteSuccessPopup() {
    const successPopup = $('#delete-success-popup');
    successPopup.css({
        'display': 'flex',
        'width': '100vw',
        'height': '100vh',
        'justify-content': 'center',
        'align-items': 'center'
    });

    
    $('#close-delete-success-btn').on('click', function () {
        successPopup.css('display', 'none');
    });
}


function showDeleteErrorPopup(errorMessage) {
    const errorPopup = $('#delete-error-popup');
    const errorMsg = $('#delete-error-message');
    errorMsg.text(errorMessage);

    errorPopup.css({
        'display': 'flex',
        'width': '100vw',
        'height': '100vh',
        'justify-content': 'center',
        'align-items': 'center'
    });

    
    $('#close-delete-error-btn').on('click', function () {
        errorPopup.css('display', 'none');
    });
}


function showPasswordPolicyError() {
    const policyErrorPopup = $('#password-policy-error-popup');
    policyErrorPopup.css({
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'center'
    });

    
    $('#close-policy-error-btn').on('click', function () {
        policyErrorPopup.css('display', 'none');
    });
}


function showChangeSuccessPopup() {
    $('.popup-container').css('display', 'none');

    const successPopup = $('#password-success-popup');
    successPopup.closest('.popup-container').css({
        'display': 'flex',
        'width': '100vw',
        'height': '100vh',
        'justify-content': 'center',
        'align-items': 'center'
    });

    $('#close-success-btn').off('click').on('click', function () {
        successPopup.closest('.popup-container').css('display', 'none');
    });
}


function showNewPasswordPopup(username) {
    togglePopup('#change-password-popup', true);

    
    $('#confirm-change-password-btn').off('click').on('click', function() {
        const newPassword = $('#new-password-input').val();
        if (!isPasswordValid(newPassword)) {
            togglePopup('#change-password-popup', false);
            showPasswordPolicyError();
            return;
        }

        
        $.ajax({
            url: '/users/update-password',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, password: newPassword }),
            success: function(response) {
                if (response.status === 'Success') {
                    togglePopup('#change-password-popup', false);
                    showChangeSuccessPopup();
                } else {
                    alert('Error: ' + response.message);
                }
            },
            error: function(error) {
                console.error('Error updating password:', error);
                alert('Error updating password.');
            }
        });
    });

    
    $('#cancel-change-password-btn').off('click').on('click', function() {
        togglePopup('#change-password-popup', false);
    });
}


function showRoleChangeSuccessPopup(message) {
    $('#role-change-success-message').text(message);
    $('#role-change-success-popup').css('display', 'flex');

    $('#close-role-change-success-btn').off('click').on('click', function () {
        $('#role-change-success-popup').css('display', 'none');
    });
}


function showRoleChangeErrorPopup(message) {
    $('#role-change-error-message').text(message);
    $('#role-change-error-popup').css('display', 'flex');

    $('#close-role-change-error-btn').off('click').on('click', function () {
        $('#role-change-error-popup').css('display', 'none');
    });
}


function isPasswordValid(password) {
    return password.length >= 8 && password.length <= 16;
}
