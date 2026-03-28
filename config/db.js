const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    await mongoose.connect("mongodb://Silveroger:52qFKJfwvyjrBphl@ac-vby2bad-shard-00-00.bepez2e.mongodb.net:27017,ac-vby2bad-shard-00-01.bepez2e.mongodb.net:27017,ac-vby2bad-shard-00-02.bepez2e.mongodb.net:27017/pecplacement?ssl=true&replicaSet=atlas-r7m8mu-shard-0&authSource=admin&retryWrites=true&w=majority");

    console.log("MongoDB Connected");

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;