const Product = require("../models/product.model");
//function for creating product
const createProduct = async (req, res) => {
  const {
    name,
    brand,
    gender,
    description,
    dressStyle,
    dressType,
    actualPrice,
    discount,
    displayImage,
    images,
    colors,
    sizes,
    reviews,
    avgRating,
  } = req.body;
  try {
    const product = await Product.createProduct(
      name,
      brand,
      gender,
      description,
      dressStyle,
      dressType,
      actualPrice,
      discount,
      displayImage,
      images,
      colors,
      sizes,
      reviews,
      avgRating
    );
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//get latest products
const latestArrivals = async (req, res) => {
  try {
    const products = await Product.latestProducts(4);
    res.status(200).json({ products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//products by avg rating of product from high to low
const ratingProducts = async (req, res) => {
  try {
    const products = await Product.ratingProducts(4);
    res.status(200).json({ products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//get single product with given id
const singleProduct = async (req, res) => {
  const { id } = req.body;
  try {
    const product = await Product.singleProduct(id);
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//get all products in database
const allProducts = async (req, res) => {
  try {
    const products = await Product.allProducts();
    res.status(200).json({ products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//get products based on name
const nameSearch = async (req, res) => {
  const { name } = req.body;
  console.log(name);
  try {
    const product = await Product.nameSearch(name);
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//Filter Products by query
const filterProducts = async (req, res) => {
  const { dressType, maxPrice, gender, color, dressStyle, sort } = req.body;
  try {
    const product = await Product.filterProducts(
      dressType,
      maxPrice,
      gender,
      color,
      dressStyle,
      sort
    );
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.messages });
  }
};
//Get distinct DressType
const getDistinctDressType = async (req, res) => {
  try {
    const product = await Product.getDistinctDressType();
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  createProduct,
  latestArrivals,
  singleProduct,
  ratingProducts,
  allProducts,
  nameSearch,
  filterProducts,
  getDistinctDressType,
};
