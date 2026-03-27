const mongoose = require("mongoose");

const internStatsSchema = new mongoose.Schema({
  branch: String,
  year: Number,
  totalStudents: Number
});

// ✅ VERY IMPORTANT FIX
module.exports =
  mongoose.models.InternStats ||
  mongoose.model("InternStats", internStatsSchema);