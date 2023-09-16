const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { encodeXText } = require("nodemailer/lib/shared");
const slugify = require("slugify");
const createProduct = asyncHandler(async (req, res) => {
  const { title, brand, price, color, description, category } = req.body;
  const images = req.files?.images?.map((el) => el.path);

  if (images) req.body.images = images;
  if (!title || !brand || !price || !color || !description || !category)
    throw new Error("Missing inputs");
  req.body.slug = slugify(req.body.title);
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : "Cannot create new product",
    // images,
  });
});
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postedBy",
      select: "firstname lastname avatar",
    },
  });

  return res.status(200).json({
    success: response ? true : false,
    productData: response ? response : "Cannot create new product",
  });
});
// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
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
  if (queries?.color) {
    delete formatQueries.color;
    const colorArr = queries.color?.split(",");
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }));
    colorqueryOj = { $or: colorQuery };
  }
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
  let queryCommand = Product.find(q);

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
  const limit = +req.query.limit || process.env.LIMIT_PRODUCT;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  //Excute query
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Product.find(q).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      products: response ? response : "Cannot get products",
      counts,
    });
  });
});
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

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
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : "Cannot update product",
  });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product",
  });
});

//Rating
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const { star, comment, pid, updatedAt } = req.body;
  if (!star || !pid) throw new Error("Mising input!!");
  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );
  if (alreadyRating) {
    // Update star and comment
    await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRating },
      },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      {
        new: true,
      }
    );
  } else {
    // Add star and comment
    const response = await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }

  //sum rating
  const updateProduct = await Product.findById(pid);
  const ratingCount = updateProduct.ratings?.length;
  const sumRating = updateProduct.ratings.reduce(
    (sum, el) => sum + +el.star,
    0
  );
  updateProduct.totalRatings = Math.round((sumRating * 10) / ratingCount) / 10;
  await updateProduct.save();
  return res.status(200).json({
    status: true,
    updateProduct,
  });
});

const uploadImageProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("Mising input!!");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updateProduct: response,
  });
});
module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImageProduct,
};
