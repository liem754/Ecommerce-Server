const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const { response } = require("express");
const createBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const images = req.files?.images?.map((el) => el.path);

  if (images) req.body.image = images;
  if (!title || !description || !category) throw new Error("Mising input!!");
  const response = await Blog.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    blog: response ? response : "Cannot create blog!!!",
  });
});
const getBlogs = asyncHandler(async (req, res) => {
  const { title } = req.query;
  if (title) {
    const response = await Blog.find({ category: title });
    return res.status(200).json({
      success: response ? true : false,
      blogs: response ? response : "Cannot get blog!!!",
    });
  } else {
    const response = await Blog.find();
    return res.status(200).json({
      success: response ? true : false,
      blogs: response ? response : "Cannot get blog!!!",
    });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;

  if (Object.keys(req.body).length === 0) throw new Error("Mising input!!");
  const response = await Blog.findByIdAndUpdate(bid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot update blog!!!",
  });
});
const deleteBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Blog.findByIdAndDelete(bid);
  return res.status(200).json({
    success: response ? true : false,
    category: response ? response : "Cannot delete blog!!!",
  });
});

const likeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;
  if (!bid) throw new Error("Mising input!!");
  const blog = await Blog.findById(bid);

  const alreadyDisliked = blog?.dislikes?.some((el) => el.toString() === _id);

  if (alreadyDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  }

  const isLiked = blog?.likes?.some((el) => el.toString() === _id);

  if (isLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { likes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  }
});
const dislikeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;
  if (!bid) throw new Error("Mising input!!");
  const blog = await Blog.findById(bid);

  const alreadyLiked = blog?.likes?.some((el) => el.toString() === _id);

  if (alreadyLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  }

  const isDisliked = blog?.dislikes?.some((el) => el.toString() === _id);

  if (isDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { dislikes: _id } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      rs: response,
    });
  }
});

// Lấy blog có thông tin những người like và dislike,tăng view
const getBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndUpdate(
    bid,
    { $inc: { numberViews: 1 } },
    { new: true }
  )
    .populate("likes", "firstname lastname")
    .populate("dislikes", "firstname lastname");
  return res.status(200).json({
    success: blog ? true : false,
    rs: blog,
  });
});

//
const uploadImageBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  if (!req.file) throw new Error("Mising input!!");
  const response = await Blog.findByIdAndUpdate(
    bid,
    {
      image: req.file.path,
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updateProduct: response,
  });
});
module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  getBlog,
  uploadImageBlog,
};
