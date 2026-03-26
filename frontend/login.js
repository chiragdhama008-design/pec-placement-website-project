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

        if (data.status === 'success') {
            // If successful, redirect to your friend's dashboard
            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server is not responding. Make sure the backend on port 5000 is running!");
    }
}