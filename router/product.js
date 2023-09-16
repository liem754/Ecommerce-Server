const router = require("express").Router();
const ctrls = require("../controllers/product");
const uploader = require("../config/cloudinary.config");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.post(
  "/",

  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  ctrls.createProduct
);
router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.array("images", 10),
  ctrls.uploadImageProduct
);

router.put(
  "/updateproduct/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  ctrls.updateProduct
);
router.put("/rating", verifyAccessToken, ctrls.ratings);
router.delete(
  "/deleteproduct/:pid",
  [verifyAccessToken, isAdmin],
  ctrls.deleteProduct
);
router.get("/", ctrls.getProducts);
router.get("/:pid", ctrls.getProduct);
module.exports = router;
