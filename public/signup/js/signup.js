async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("error-message");

    
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

            
            if (response.ok) {
                const data = await response.json();
                alert("Sign-up successful!");
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
        
        errorMessage.textContent = "Passwords do not match";
        errorMessage.style.visibility = "visible";
    }
}

