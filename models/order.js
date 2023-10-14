const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Types.ObjectId, ref: "Product" },
      quantity: Number,
      color: String,
      price: Number,
    },
  ],
  status: {
    type: String,
    default: "Proccessing",
    enum: ["proccessing", "Cancelled", "Succeed"],
  },
  total: Number,

  orderBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

//Export the model
module.exports = mongoose.model("Order", userSchema);
