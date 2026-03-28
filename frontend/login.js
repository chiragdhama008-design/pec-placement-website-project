// login.js

async function handleCredentialResponse(response) {
    try {
        // Send the token to the Express server your friend built
        const res = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        // Inside your handleCredentialResponse function:
        if (data.status === 'success') {
            // Use the URL provided by the server instead of a hardcoded path
            window.location.href = data.redirect_url;
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server is not responding. Make sure the backend on port 5000 is running!");
    }
}