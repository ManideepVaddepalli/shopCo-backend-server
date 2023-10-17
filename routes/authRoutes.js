const express = require("express");
const router = express.Router();
const {
  authCheck,
  addItem,
  writeReview,
  removeItem,
} = require("../controllers/authContollers");
const { requireAuth } = require("../middleware/requireAuth");

router.use(requireAuth);
router.post("/check", authCheck);
router.post("/user/addItem", addItem);
router.post("/product/writeReview", writeReview);
router.post("/user/removeItem", removeItem);

module.exports = router;
