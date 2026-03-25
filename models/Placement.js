const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
  sid: String,
  name: String,
  company: String,
  city: String,
  package: Number,
  branch: String,
  year: Number
});


module.exports = mongoose.model("Placement", placementSchema);
