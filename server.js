const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const placementRoutes = require("./routes/placementRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/placements", placementRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});




