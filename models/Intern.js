const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  sid: String,
  name: String,
  company: String,
  city: String,
  duration: Number, // <-- Important: Added for your intern table!
  stipend: Number,
  branch: String,
  year: Number
});

module.exports = mongoose.model("Intern", internSchema);