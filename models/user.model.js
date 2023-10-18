const mongoose = require("mongoose");
const ObjectId = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      _id: 0,
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      price: { type: Number, required: true },
      colors: { type: Array, required: true },
      image: { type: String, required: true },
      sizeQuantity: [
        {
          _id: 0,
          size: { type: String, required: true },
          quantity: { type: Number, required: true },
        },
      ],
    },
  ],
});

//static sigup medthod
userSchema.statics.signup = async function (name, email, password) {
  const exists = await this.findOne({ email });
  if (exists) {
    //email already in use error
    throw Error("1");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ name, email, password: hash, cart: [] });
  const condensed = {
    _id: user._id,
    name: user.name,
    email: user.email,
    cart: user.cart,
  };
  return condensed;
};
//static login method
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    //email not registerd
    throw Error("1");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    //Incorrect password
    throw Error("2");
  }
  const condensed = {
    _id: user._id,
    name: user.name,
    email: user.email,
    cart: user.cart,
  };
  return condensed;
};
//static add to cart method
userSchema.statics.addItem = async function (
  userId,
  productId,
  productName,
  price,
  colors,
  image,
  productQuantity,
  productSize
) {
  if (!userId) {
    throw Error("User ID required");
  }
  if (!productId) {
    throw Error("Product ID required");
  }
  if (!productQuantity) {
    throw Error("Product Quantity required");
  }
  if (!productName) {
    throw Error("Product Name required");
  }
  if (!price) {
    throw Error("Product price required");
  }
  if (!colors) {
    throw Error("Product color array required");
  }
  if (!productSize) {
    throw Error("Product Size required");
  }
  if (!image) {
    throw Error("Image required");
  }
  if (!ObjectId.isValidObjectId(userId)) {
    throw Error("Not a Valid User ID");
  }
  const exists = await this.findOne({ _id: userId });
  if (!exists) {
    throw Error("User doesn't exist");
  }
  const hasProduct = await this.findOne({
    _id: userId,
    "cart.productId": productId,
  });
  if (!hasProduct) {
    await this.updateOne(
      { _id: userId },
      {
        $push: {
          cart: {
            productId,
            productName,
            price,
            colors,
            image,
            sizeQuantity: [{ size: productSize, quantity: productQuantity }],
          },
        },
      }
    );
    return await this.findOne({
      _id: userId,
    });
  }
  const hasSize = await this.findOne({
    _id: userId,
    cart: {
      $elemMatch: {
        productId: productId,
        sizeQuantity: { $elemMatch: { size: productSize } },
      },
    },
  });
  if (!hasSize) {
    await this.updateOne(
      {
        _id: userId,
        "cart.productId": productId,
      },
      {
        $push: {
          "cart.$[el].sizeQuantity": {
            size: productSize,
            quantity: productQuantity,
          },
        },
      },
      { arrayFilters: [{ "el.productId": productId }] }
    );
    return await this.findOne({
      _id: userId,
    });
  }

  let number = hasSize.cart.filter((elem) => elem.productId == productId);
  number = number[0].sizeQuantity;
  number = number.filter((elem) => elem.size == productSize);
  number = number[0].quantity;
  number = number + Number(productQuantity);
  // number = number.map((elem) => {
  //   if (elem.size == productSize) {
  //     return elem.quantity;
  //   }
  // });
  await this.updateOne(
    {
      _id: userId,
      "cart.productId": productId,
      "cart.sizeQuantity.size": productSize,
    },
    {
      $set: {
        "cart.$[d].sizeQuantity.$[el].quantity": number,
      },
    },
    { arrayFilters: [{ "d.productId": productId }, { "el.size": productSize }] }
  );
  return await this.findOne({
    _id: userId,
  });
};
//Remove a Item from Cart
userSchema.statics.removeItem = async function (
  userId,
  productId,
  productSize
) {
  if (!userId) {
    throw Error("Provide UserID");
  }
  if (!productId) {
    throw Error("Provide productID");
  }
  if (!ObjectId.isValidObjectId(userId)) {
    throw Error("Provide valid userId");
  }
  if (!productSize) {
    throw Error("Provide product Size ");
  }
  const existsUser = await this.findOne({ _id: userId });
  if (!existsUser) {
    throw Error("User doesnt exists");
  }
  const existsProduct = await this.findOne({
    _id: userId,
    "cart.productId": productId,
  });
  if (!existsProduct) {
    throw Error("Product doesnt exist in this user Cart");
  }
  const producthasSize = await this.findOne({
    _id: userId,
    "cart.productId": productId,
    "cart.sizeQuantity.size": productSize,
  });
  if (!producthasSize) {
    throw Error("Doesnt has product with that size");
  }
  const cart = producthasSize.cart;
  const singleProduct = cart.filter((item) => item.productId == productId);
  const sizeQuantityArray = [...singleProduct[0].sizeQuantity];
  const length = sizeQuantityArray.length;
  if (length == 1) {
    await this.updateOne(
      {
        _id: userId,
        "cart.productId": productId,
      },
      { $pull: { cart: { productId: productId } } }
    );
    return await this.findOne({ _id: userId });
  }
  await this.updateOne(
    {
      _id: userId,
      "cart.productId": productId,
      "cart.sizeQuantity.size": productSize,
    },
    { $pull: { "cart.$[c].sizeQuantity": { size: productSize } } },
    { arrayFilters: [{ "c.productId": productId }] }
  );
  return await this.findOne({ _id: userId });
};

module.exports = mongoose.model("User", userSchema);
