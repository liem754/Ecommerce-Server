const asyncHandler = require("express-async-handler");
const Brand = require("../models/brand");
const createBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    brand: response ? response : "Cannot create brand!!!",
  });
});
const getBrands = asyncHandler(async (req, res) => {
  const response = await Brand.find().select("title _id");
  return res.status(200).json({
    success: response ? true : false,
    brands: response ? response : "Cannot get brand!!!",
  });
});
const updateBrand = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Mising input!!");
  const response = await Brand.findByIdAndUpdate(bcid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    brand: response ? response : "Cannot update brand!!!",
  });
});
const deleteBrand = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await Brand.findByIdAndDelete(bcid);
  return res.status(200).json({
    success: response ? true : false,
    brand: response ? response : "Cannot delete brand!!!",
  });
});
module.exports = {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
};
