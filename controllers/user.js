const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendMail = require("../ultils/sendMail");
const crypto = require("crypto");
const makeToken = require("uniqid");

const register = asyncHandler(async (req, res, next) => {
  const { email, firstname, lastname, password, mobile } = req.body;
  if (!email || !firstname || !lastname || !password || !mobile)
    return res.status(400).json({
      success: false,
      mes: "Missing input",
    });
  const user = await User.findOne({ email });
  if (user) throw new Error("User has existed!");
  else {
    const token = makeToken();
    const newUser = await User.create({
      email: btoa(email) + "@" + token,
      firstname,
      lastname,
      mobile,
      password,
    });
    if (newUser) {
      const html = `<h2>Register code:</h2> <br /> <blockquote>${token}</blockquote>`;
      await sendMail({
        email,
        html,
        subject: "Hoàn tất đăng ký Digital Technology",
      });
    }
    setTimeout(async () => {
      await User.deleteOne({ email: btoa(email) + "@" + token });
    }, [5 * 60 * 1000]);

    return res.json({
      success: newUser ? true : false,
      mes: newUser ? "Please check email của bạn!" : "Some wrong, please!",
    });
  }
});
//
const finalRegister = asyncHandler(async (req, res) => {
  // const cookie = req.cookies;
  const { token } = req.params;
  const notActive = await User.findOne({ email: new RegExp(`${token}$`) });
  if (notActive) {
    notActive.email = atob(notActive.email.split("@")[0]);
    notActive.save();
  }
  res.status(200).json({
    success: notActive ? true : false,
    mes: notActive
      ? "Register is successfully!!.Please login now!"
      : "Something went wrong",
  });
  // const response = await User.create({
  //   email: cookie?.dataregister?.email,
  //   password: cookie?.dataregister?.password,
  //   firstname: cookie?.dataregister?.firstname,
  //   lastname: cookie?.dataregister?.lastname,
  //   mobile: cookie?.dataregister?.mobile,
  // });

  // if (response)
  //   return res.redirect(`${process.env.URL_CLIENT}/finalregister/true`);
  // else {
  //   return res.redirect(`${process.env.URL_CLIENT}/finalregister/false`);
  // }

  // return;
  // res.status(200).json({
  //   success: response ? true : false,
  //   mes: response
  //     ? "Register is successfully!!.Please login now!"
  //     : "Something went wrong",
  // });
});
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    //Tách password và role ra từ response
    const { password, role, refreshToken, ...userData } = response.toObject();
    //Tạo accessToken
    const accessToken = generateAccessToken(response._id, role);
    //Tạo refreshToken
    const newrefreshToken = generateRefreshToken(response._id);
    //Đẩy refreshToken vô database
    await User.findByIdAndUpdate(
      response._id,
      { newrefreshToken },
      { new: true }
    );
    //Lưu refreshToken vào cookie
    res.cookie("refreshToken", newrefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      accessToken,
      userData,
      mes: "Login success!",
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const getOne = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("-refreshToken -password ");
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
});
const getOneById = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const user = await User.findById(_id).select("-refreshToken -password -role");
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
});
//tạo token mới khi token hết hạn
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token hay không
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  });
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Xóa refresh token ở db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // Xóa refresh token ở cookie trình duyệt
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: "Logout is done",
  });
});
// Client gửi email
// Server check email có hợp lệ hay không => Gửi mail + kèm theo link (password change token)
// Client check mail => click link
// Client gửi api kèm token
// Check token có giống với token mà server gửi mail hay không
// Change password

//Gữi mail change password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Missing email");
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_CLIENT}/reset-password/${resetToken}>Click here</a>`;

  const data = {
    email,
    html,
    subject: "Forgot password",
  };
  const rs = await sendMail(data);
  return res.status(200).json({
    success: true,
    rs,
  });
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) throw new Error("Missing imputs");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Invalid reset token");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();
  return res.status(200).json({
    success: user ? true : false,
    mes: user ? "Updated password" : "Something went wrong",
  });
});
const getUsers = asyncHandler(async (req, res) => {
  // const response = await User.find().select("-refreshToken -password -role");
  // return res.status(200).json({
  //   success: response ? true : false,
  //   users: response,
  // });
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatQueries = JSON.parse(queryString);
  if (queries?.name)
    formatQueries.name = { $regex: queries.name, $options: "i" };
  if (req.query.q) {
    delete formatQueries.q;
    formatQueries["$or"] = [
      { firstname: { $regex: req.query.q, $options: "i" } },
      { lastname: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } },
    ];
  }
  let queryCommand = User.find(formatQueries);

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
    const counts = await User.find(formatQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      users: response ? response : "Cannot get products",
      counts,
    });
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  if (!_id) throw new Error("Missing inputs");
  const response = await User.findByIdAndDelete(_id);
  return res.status(200).json({
    success: response ? true : false,
    deletedUser: response
      ? `User with email ${response.email} deleted`
      : "No user delete",
  });
});
const updateUser = asyncHandler(async (req, res) => {
  //
  const { _id } = req.user;
  const {
    email,
    mobile,
    firstname,
    lastname,
    address,

    avatar,
  } = req.body;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing inputs");

  const data = { email, mobile, firstname, lastname, address };
  if (req.file) data.avatar = req.file.path;
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Some thing went wrong",
  });
});
const updateUserByAdmin = asyncHandler(async (req, res) => {
  //
  const { uid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Some thing went wrong",
  });
});

//add address
const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!req.body.address) throw new Error("Mising input!!");
  const response = await User.findByIdAndUpdate(
    _id,
    { $push: { address: req.body.address } },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updateUser: response,
  });
});

//
const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, quantity = 1, color, price, title, thumb } = req.body;
  if (!pid || !quantity || !color || !title || !thumb)
    throw new Error("Missing input!!");
  const cartUser = await User.findById(_id).select("cart");
  const alreadyCart = cartUser.cart.find(
    (el) => el.product.toString() === pid && el.color.toString() === color
  );

  if (alreadyCart && alreadyCart.color === color) {
    const response = await User.updateOne(
      { cart: { $elemMatch: alreadyCart } },
      { $set: { "cart.$.quantity": quantity, "cart.$.price": price } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response
        ? "Cập Nhập Giỏ Hàng Thành Công!"
        : "Some thing went wrong!",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: { cart: { product: pid, quantity, color, price, title, thumb } },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response ? "Đã Thêm Vào Giỏ Hàng!" : "Some thing went wrong!",
    });
  }
});
const removeCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color } = req.params;
  if (!pid) throw new Error("Missing input!!");
  const cartUser = await User.findById(_id).select("cart");
  const alreadyCart = cartUser.cart.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  if (!alreadyCart)
    return res.status(200).json({
      success: true,
      mes: "Update your cart!",
    });
  const response = await User.findByIdAndUpdate(
    _id,
    { $pull: { cart: { product: pid, color } } },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Đã Xóa Sản Phẩm Khỏi Giỏ Hàng!" : "Some thing went wrong!",
  });
});
module.exports = {
  register,
  login,
  getOne,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateUserAddress,
  updateCart,
  finalRegister,
  getOneById,
  removeCart,
};
