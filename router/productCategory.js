const router = require("express").Router();
const ctrls = require("../controllers/productCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.post("/", [verifyAccessToken, isAdmin], ctrls.createCategory);
router.put("/:cid", [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete("/:cid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);
router.get("/", ctrls.getCategory);

module.exports = router;
