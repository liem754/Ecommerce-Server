const router = require("express").Router();
const ctrls = require("../controllers/coupon");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.post("/", [verifyAccessToken, isAdmin], ctrls.createCoupon);
router.put("/:cid", [verifyAccessToken, isAdmin], ctrls.updateCoupon);
router.delete("/:cid", [verifyAccessToken, isAdmin], ctrls.deleteCoupon);
router.get("/", ctrls.getCoupons);

module.exports = router;
