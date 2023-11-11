const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: Number,
        color: String,
        price: Number,
        title: String,
        thumb: String,
      },
    ],
    pay: {
      type: String,
    },
    address: String,
    transpost: String,

    status: {
      type: String,
      default: "Đang chờ xử lý",
    },
    total: Number,

    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", userSchema);
