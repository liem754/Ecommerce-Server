const router = require("express").Router();
const ctrls = require("../controllers/order");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createOrder);
router.put("/", verifyAccessToken, ctrls.updateStatus);

router.get("/", verifyAccessToken, ctrls.getOrders);
router.get("/all", verifyAccessToken, isAdmin, ctrls.getOrdersbyAdmin);

// router.post("/category", ctrls.insertCategory);
module.exports = router;
