const User = require("../models/user.model");
const Product = require("../models/product.model");
///check auth token
const authCheck = (req, res) => {
  if (!req.user) {
    return res.status(400).json({ error: "Not authorized" });
  }
  const { _id, name, email, cart } = req.user;
  res.status(200).json({ _id, name, email, cart });
};
//addingh item to cart
const addItem = async (req, res) => {
  const {
    userId,
    productId,
    productName,
    price,
    colors,
    image,
    productQuantity,
    productSize,
  } = req.body;
  try {
    const { _id, name, email, cart } = await User.addItem(
      userId,
      productId,
      productName,
      price,
      colors,
      image,
      productQuantity,
      productSize
    );
    res.status(200).json({ _id, name, email, cart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//write review for a product
const writeReview = async (req, res) => {
  const { reviewName, rating, reviewDesc, postedOn, productId } = req.body;
  try {
    const product = await Product.writeReview(
      productId,
      reviewName,
      rating,
      reviewDesc,
      postedOn
    );
    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//Remove Item from Users Cart
const removeItem = async (req, res) => {
  const { userId, productId, productSize } = req.body;
  try {
    const user = await User.removeItem(userId, productId, productSize);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = { authCheck, addItem, writeReview, removeItem };
