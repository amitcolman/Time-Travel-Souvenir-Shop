document.addEventListener("DOMContentLoaded", function() {
    fetch('/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            fetch('/users/get-session')
                .then(response => response.json())
                .then(sessionData => {
                    if (sessionData.status === 'Success') {
                        document.querySelectorAll('.auth-login-signup').forEach(el => {
                            el.style.display = 'none';
                        });
                        document.querySelectorAll('.auth-profile-logout').forEach(el => {
                            el.style.display = 'block';
                        });

                        if (sessionData.user.types.includes('admin')) {
                            document.querySelectorAll('.auth-admin').forEach(el => {
                                el.style.display = 'block';
                            });
                        }

                        const logoutLink = document.getElementById('logout-link');
                        if (logoutLink) {
                            logoutLink.addEventListener('click', function(event) {
                                event.preventDefault();

                                fetch('/users/logout')
                                    .then(response => {
                                        if (response.ok) {
                                            window.location.href = '/';
                                        } else {
                                            console.error("Logout failed.");
                                        }
                                    })
                                    .catch(error => console.error("Error logging out:", error));
                            });
                        }
                    } else {
                        document.querySelectorAll('.auth-login-signup').forEach(el => {
                            el.style.display = 'block';
                        });
                        document.querySelectorAll('.auth-profile-logout').forEach(el => {
                            el.style.display = 'none';
                        });
                    }
                })
        });
});
