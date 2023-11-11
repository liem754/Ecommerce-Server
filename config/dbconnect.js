const { default: mongoose } = require("mongoose");
const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    if (conn.connection.readyState === 1) {
      console.log("Connect db is success !!");
    } else {
      console.log("Connect db is failed");
    }
  } catch (error) {
    console.log("Connect db is failed");
    throw new Error(error);
  }
};
module.exports = dbConnect;
