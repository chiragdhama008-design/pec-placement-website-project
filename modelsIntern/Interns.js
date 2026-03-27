const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  sid: String,
  name: String,
  company: String,
  city: String,
  duration: Number,
  stipend: Number,
  branch: String,
  year: Number
});


module.exports =
  mongoose.models.Intern ||
  mongoose.model("Intern", internSchema);
