const asyncHandler = require("express-async-handler");
const ProductCategory = require("../models/productCategory");
const createCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot create category!!!",
  });
});
const getCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find();
  return res.status(200).json({
    success: response ? true : false,
    categorys: response ? response : "Cannot get category!!!",
  });
});
const updateCategory = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Mising input!!");
  const response = await ProductCategory.findByIdAndUpdate(cid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot update category!!!",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(cid);
  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot delete category!!!",
  });
});
module.exports = {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
