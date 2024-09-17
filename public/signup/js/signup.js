async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("error-message");

    // Basic validation to check if passwords match
    if (password === confirmPassword) {
        errorMessage.style.visibility = "hidden";

        try {
            const response = await fetch("http://localhost:3000/users/create", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            // Check if the response is successful
            if (response.ok) {
                const data = await response.json();
                alert("Sign-up successful!");
                console.log("User created:", data);
                window.location.href = "/login";
            } else {
                const errorData = await response.json();
                errorMessage.textContent = `Error: ${errorData.message}`;
                errorMessage.style.visibility = "visible";
            }
        } catch (error) {
            console.error("Error occurred during signup:", error);
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.visibility = "visible";
        }
    } else {
        // Show error if passwords don't match
        errorMessage.textContent = "Passwords do not match";
        errorMessage.style.visibility = "visible";
    }
}

