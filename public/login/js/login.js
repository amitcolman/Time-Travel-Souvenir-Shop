document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", login);
});


async function login() {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch("http://localhost:3000/users/login", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

       alert(response.ok)

        // Check if the response is successful
        if (response.ok) {
            const data = await response.json();
            alert("Log-in successful!");
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
}