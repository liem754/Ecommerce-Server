const asyncHandler = require("express-async-handler");
const BlogCategory = require("../models/blogCategory");
const createCategory = asyncHandler(async (req, res) => {
  const rs = await BlogCategory.findOne(req.body);
  if (rs) {
    return res.status(200).json({
      success: true,
    });
  } else {
    const response = await BlogCategory.create(req.body);
    return res.status(200).json({
      success: response ? true : false,
      category: response ? response : "Cannot create category!!!",
    });
  }
});
const getCategory = asyncHandler(async (req, res) => {
  const response = await BlogCategory.find().select("title _id");
  return res.status(200).json({
    success: response ? true : false,
    categorys: response ? response : "Cannot get category!!!",
  });
});
const updateCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Mising input!!");
  const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot update category!!!",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await BlogCategory.findByIdAndDelete(bcid);
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
