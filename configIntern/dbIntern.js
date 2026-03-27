const mongoose = require("mongoose");

const connectDB1 = async () => {
  try {

    await mongoose.connect("mongodb://localhost:27017/pecplacements");

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB1;