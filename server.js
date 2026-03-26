const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const placementRoutes = require("./routes/placementRoutes");

// 1. Import Google Auth Library
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const app = express();

// 2. Setup your Google Client
const CLIENT_ID = "832533236059-bhhhjtupvlks59ht7a4b78th5jgucd5l.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const ADMIN_EMAIL = "placement_admin@pec.edu.in"; 

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
// Your friend's existing routes
app.use("/api/placements", placementRoutes);

// 3. YOUR NEW LOGIN ROUTE
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        
        // Routing Logic
        if (userEmail === ADMIN_EMAIL || userEmail.endsWith('@pec.edu.in')) {
            // Valid college user
            res.json({ status: "success", message: "Login successful!" });
        } else {
            // Deny outsiders
            res.status(403).json({ 
                status: "error", 
                message: "Access Denied. Please use a valid college ID." 
            });
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ status: "error", message: "Invalid login token." });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
