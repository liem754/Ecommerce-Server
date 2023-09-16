const router = require("express").Router();
const ctrls = require("../controllers/bill");
const uploader = require("../config/cloudinary.config");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createBill);
router.put("/:oid", [verifyAccessToken, isAdmin], ctrls.updateStatus);
router.get("/", verifyAccessToken, ctrls.getUserBill);
router.get("/admin", [verifyAccessToken, isAdmin], ctrls.getBills);
module.exports = router;
