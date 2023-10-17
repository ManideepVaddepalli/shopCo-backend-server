const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Auth required" });
  }
  let token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id });
    const condensed = {
      _id: user._id,
      name: user.name,
      email: user.email,
      cart: user.cart,
    };
    req.user = condensed;
    next();
  } catch (error) {
    res.status(401).json({ error: "Request is not arthorised" });
  }
};

module.exports = { requireAuth };
