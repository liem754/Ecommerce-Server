const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const { response } = require("express");
const createBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const images = req.files?.images?.map((el) => el.path);

  if (images) req.body.images = images;
  if (!title || !description || !category) throw new Error("Mising input!!");
  const response = await Blog.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    blog: response ? response : "Cannot create blog!!!",
  });
});
const getBlogs = asyncHandler(async (req, res) => {
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
  let colorqueryOj = {};
  // Filter
  if (queries?.title)
    formatQueries.title = { $regex: queries.title, $options: "i" };
  if (queries?.category)
    formatQueries.category = {
      $regex: queries.category,
      $options: "i",
    };

  if (req.query.q) {
    delete formatQueries.q;
    formatQueries["$or"] = [
      { title: { $regex: req.query.q, $options: "i" } },
      { brand: { $regex: req.query.q, $options: "i" } },
      { category: { $regex: req.query.q, $options: "i" } },
    ];
  }
  const q = { ...colorqueryOj, ...formatQueries };
  formatQueries.color = { $regex: queries.color, $options: "i" };
  let queryCommand = Blog.find(q);

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCT;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  //Excute query
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Blog.find(q).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      blogs: response ? response : "Cannot get blogs",
      counts,
      limit,
    });
  });
});

const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  let file = req.files;
  if (file?.images) {
    const images = file?.images?.map((el) => el.path);
    const final = [...req.body.images.slice(1), ...images];
    req.body.images = final.filter((item) => item.length > 1);
  } else {
    req.body.images = req.body?.images
      .filter((item) => item !== (item.length === 1))
      .slice(1);
  }
  if (Object.keys(req.body).length === 0) throw new Error("Mising input!!");
  const response = await Blog.findByIdAndUpdate(bid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Successfully updated blog" : "Cannot update blog!!!",
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
      mes: "Cancel dislike successfully !",
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
      mes: "Cancel like successfully !",
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
      mes: "Like the blog successfully !",
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
      mes: "Cancel like successfully !",
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
      mes: "Cancel dislike successfully !",
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
      mes: "Dislike the blog successfully !",
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
      images: req.file.path,
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
