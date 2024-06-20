const { default: mongoose } = require("mongoose");
const { print, OutputType } = require("../helpers/print");
const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGODB_URL2);
    if (conn.connection.readyState === 1) {
      print("Connect db is success !", OutputType.SUCCESS);
    } else {
      print("Connect db is failed !", OutputType.ERROR);
    }
  } catch (error) {
    print("Connect db is failed !", OutputType.ERROR);

    throw new Error(error);
  }
};
module.exports = dbConnect;
