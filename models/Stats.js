const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  branch: String,
  year: Number,
  totalStudents: Number
});

module.exports = mongoose.model("Stats", statsSchema);