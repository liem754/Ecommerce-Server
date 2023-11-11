const Order = require("../models/order");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");
const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { products, total, address, status, pay, transpost } = req.body;
  if (address) {
    await User.findByIdAndUpdate(_id, { address, cart: [] }, { new: true });
  }
  const rs = await Order.create({
    products,
    total,
    orderBy: _id,
    status,
    address,
    transpost,
    pay,
  });
  return res.json({
    success: rs ? true : false,
    rs: rs ? rs : "Something went wrong",
  });
});
const updateStatus = asyncHandler(async (req, res) => {
  // const { oid } = req.params;
  const { status, oid } = req.body;
  if (!status) throw new Error("Missing status");
  const response = await Order.findByIdAndUpdate(
    oid,
    { status },
    { new: true }
  );
  return res.json({
    success: response ? true : false,
    response: response ? response : "Something went wrong",
  });
});
const getOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { _id } = req.user;
  // Tach cac truong dac biet ra khoi queries
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  // format sang mongose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatQueries = JSON.parse(queryString);
  // Filter
  if (queries?.status)
    formatQueries.status = { $regex: queries.status, $options: "i" };

  const q = { ...formatQueries, orderBy: _id };
  let queryCommand = Order.find(q);

  // 2) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Filter limit
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 5;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  //Excute query
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Order.find(q).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      orders: response ? response : "Cannot get products",
      counts,
    });
  });
});
const getOrdersbyAdmin = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  // Tach cac truong dac biet ra khoi queries
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  // format sang mongose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatQueries = JSON.parse(queryString);
  // Filter
  if (queries?.status)
    formatQueries.status = { $regex: queries.status, $options: "i" };

  const q = { ...formatQueries };
  let queryCommand = Order.find(q);

  // 2) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Filter limit
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 5;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  //Excute query
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Order.find(q).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      orders: response ? response : "Cannot get products",
      counts,
    });
  });
});

module.exports = {
  createOrder,
  updateStatus,
  getOrders,
  getOrdersbyAdmin,
};
