const routerUser = require("./user");
const routerProduct = require("./product");
const routerProductCategory = require("./productCategory");
const routerBlogCategory = require("./blogCategory");
const routerBlog = require("./blog");
const routerBrand = require("./brand");
const routerCoupon = require("./coupon");
const routerBill = require("./bill");
const order = require("./order");
const payment = require("./payment");
const { notFound, errHandler } = require("../middlewares/errHandler");
const initRoutes = (app) => {
  app.use("/api/v1/user", routerUser);
  app.use("/api/v1/product", routerProduct);
  app.use("/api/v1/productcategory", routerProductCategory);
  app.use("/api/v1/blogcategory", routerBlogCategory);
  app.use("/api/v1/blog", routerBlog);
  app.use("/api/v1/brand", routerBrand);
  app.use("/api/v1/coupon", routerCoupon);
  app.use("/api/v1/bill", routerBill);
  app.use("/api/v1/order", order);
  app.use("/api/v1/payment", payment);

  app.use(notFound);
  app.use(errHandler);
};
module.exports = initRoutes;
