const express = require("express");
const router = express.Router();
const {
  createProduct,
  latestArrivals,
  singleProduct,
  allProducts,
  ratingProducts,
  nameSearch,
  filterProducts,
  getDistinctDressType,
} = require("../controllers/productControllers");

//product creation route
router.post("/create", createProduct);
router.get("/newArrivals", latestArrivals);
router.get("/byRatingProducts", ratingProducts);
router.post("/singleProduct", singleProduct);
router.get("/allProducts", allProducts);
router.post("/nameSearch", nameSearch);
router.post("/filterProducts", filterProducts);
router.get("/getDistinct", getDistinctDressType);

module.exports = router;
