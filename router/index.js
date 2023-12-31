const routerUser = require("./user");
const routerProduct = require("./product");
const routerProductCategory = require("./productCategory");
const routerBlogCategory = require("./blogCategory");
const routerBlog = require("./blog");
const routerBrand = require("./brand");
const routerCoupon = require("./coupon");
const routerBill = require("./bill");
const routerInsert = require("./insert");
const order = require("./order");
const { notFound, errHandler } = require("../middlewares/errHandler");
const initRoutes = (app) => {
  app.use("/api/user", routerUser);
  app.use("/api/product", routerProduct);
  app.use("/api/productcategory", routerProductCategory);
  app.use("/api/blogcategory", routerBlogCategory);
  app.use("/api/blog", routerBlog);
  app.use("/api/brand", routerBrand);
  app.use("/api/coupon", routerCoupon);
  app.use("/api/bill", routerBill);
  app.use("/api/insert", routerInsert);
  app.use("/api/order", order);

  app.use(notFound);
  app.use(errHandler);
};
module.exports = initRoutes;
