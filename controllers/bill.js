const Bill = require("../models/bill");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");
const createBill = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { coupon } = req.body;
  const billCart = await User.findById(_id)
    .select("cart")
    .populate("cart.product", "title price");
  const products = billCart.cart.map((el) => ({
    product: el.product._id,
    count: el.quantity,
    color: el.color,
  }));
  let total = billCart.cart.reduce(
    (sum, el) => el.product.price * el.quantity + sum,
    0
  );
  const createData = { products, total, orderBy: _id };
  if (coupon) {
    const selectCoupon = await Coupon.findById(coupon);
    total =
      Math.round((total * (1 - +selectCoupon.discount / 100)) / 1000) * 1000 ||
      total;
    createData.total = total;
    createData.coupon = coupon;
  }
  const rs = await Bill.create(createData);

  return res.status(200).json({
    success: rs ? true : false,
    bill: rs ? rs : "Something went wrong!!",
  });
});
const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const { status } = req.body;
  if (!status) throw new Error("Mising input!!");
  const rs = await Bill.findByIdAndUpdate(oid, { status }, { new: true });

  return res.status(200).json({
    success: rs ? true : false,
    bill: rs ? rs : "Something went wrong!!",
  });
});
const getUserBill = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const rs = await Bill.find({ orderBy: _id });
  return res.status(200).json({
    success: rs ? true : false,
    bill: rs ? rs : "Something went wrong!!",
  });
});
const getBills = asyncHandler(async (req, res) => {
  const rs = await Bill.find();
  return res.status(200).json({
    success: rs ? true : false,
    bill: rs ? rs : "Something went wrong!!",
  });
});
module.exports = {
  createBill,
  updateStatus,
  getUserBill,
  getBills,
};
