const router = require("express").Router();
const ctrls = require("../controllers/brand");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.post("/", [verifyAccessToken, isAdmin], ctrls.createBrand);
router.put("/:bcid", [verifyAccessToken, isAdmin], ctrls.updateBrand);
router.delete("/:bcid", [verifyAccessToken, isAdmin], ctrls.deleteBrand);
router.get("/", ctrls.getBrands);

module.exports = router;
