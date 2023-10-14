const router = require("express").Router();
const ctrls = require("../controllers/user");
const uploader = require("../config/cloudinary.config");

const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.post("/register", ctrls.register);
router.put("/finalregister/:token", ctrls.finalRegister);
router.post("/login", ctrls.login);

router.get("/current", verifyAccessToken, ctrls.getOne);
router.get("/current/:_id", verifyAccessToken, ctrls.getOneById);

router.put("/address", [verifyAccessToken], ctrls.updateUserAddress);
router.put("/cart", [verifyAccessToken], ctrls.updateCart);
router.put("/remove-cart/:pid/:color", [verifyAccessToken], ctrls.removeCart);

router.post("/refreshtoken", ctrls.refreshAccessToken);

router.get("/logout", ctrls.logout);
router.post("/forgotpassword", ctrls.forgotPassword);
router.put("/resetpassword", ctrls.resetPassword);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.delete("/:_id", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.put(
  "/current",
  verifyAccessToken,
  uploader.fields([
    {
      name: "avatar",
      maxCount: 10,
    },
  ]),
  ctrls.updateUser
);
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);
module.exports = router;
