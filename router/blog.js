const router = require("express").Router();
const ctrls = require("../controllers/blog");
const uploader = require("../config/cloudinary.config");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
router.put("/like/:bid", verifyAccessToken, ctrls.likeBlog);
router.get("/one/:bid", ctrls.getBlog);
router.put("/dislike/:bid", verifyAccessToken, ctrls.dislikeBlog);
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  ctrls.createBlog
);
router.put("/:bid", [verifyAccessToken, isAdmin], ctrls.updateBlog);
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrls.deleteBlog);
router.put(
  "/uploadimage/:bid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  ctrls.uploadImageBlog
);
router.get("/", ctrls.getBlogs);
module.exports = router;
