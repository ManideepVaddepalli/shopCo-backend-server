const mongoose = require("mongoose");
const ObjectId = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
    },
    brand: {
      required: true,
      type: String,
    },
    gender: {
      required: true,
      type: String,
    },
    avgRating: {
      type: Number,
    },
    description: {
      type: String,
    },
    dressStyle: {
      required: true,
      type: String,
    },
    dressType: {
      required: true,
      type: String,
    },
    actualPrice: {
      required: true,
      type: Number,
    },
    discount: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    displayImage: {
      type: String,
      required: true,
    },
    images: { type: Array },
    colors: {
      type: Array,
      required: true,
    },
    sizes: {
      type: Array,
      required: true,
    },
    reviews: [
      {
        reviewName: { type: String, required: true },
        rating: { type: Number, required: true },
        reviewDesc: { type: String, required: true },
        postedOn: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);
//create function
productSchema.statics.createProduct = async function (
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
) {
  if (!name) {
    throw Error("Name Required");
  }
  if (!brand) {
    throw Error("Brand Required");
  }
  if (!actualPrice) {
    throw Error("Actual Price Required");
  }
  if (!displayImage) {
    throw Error("Display Image Required");
  }
  if (!colors) {
    throw Error("Colors Required");
  }
  if (!gender) {
    throw Error("Gender Required");
  }
  if (!dressStyle) {
    throw Error("Dress style Required");
  }
  if (!sizes) {
    throw Error("Sizes Required");
  }
  if (!dressType) {
    throw Error("Dress Type Required");
  }
  if (reviews[0]) {
    if (!reviews[0].reviewName) {
      throw Error("Reviewer name required");
    }
    if (!reviews[0].rating) {
      throw Error("Review rating required");
    }
    if (!reviews[0].reviewDesc) {
      throw Error("Review description required");
    }
    if (!reviews[0].postedOn) {
      throw Error("Review date required");
    }
  }
  const discountPrice = Number(
    (
      Number(actualPrice) -
      Number(actualPrice) * (Number(discount) / 100)
    ).toFixed(2)
  );
  const product = await this.create({
    name,
    brand,
    gender,
    description: description ? description : "",
    dressStyle,
    dressType,
    actualPrice,
    discount: discount ? discount : 0,
    discountPrice: discount ? discountPrice : actualPrice,
    displayImage,
    images,
    colors,
    sizes,
    reviews,
    avgRating,
  });
  return product;
};
productSchema.statics.latestProducts = async function (limit) {
  if (!limit) {
    throw Error("Specify the limit");
  }
  const products = await this.find().sort({ createdAt: -1 }).limit(limit);
  return products;
};
productSchema.statics.ratingProducts = async function (limit) {
  if (!limit) {
    throw Error("Specify the limit");
  }
  const products = await this.find().sort({ avgRating: -1 }).limit(limit);
  return products;
};
productSchema.statics.singleProduct = async function (id) {
  if (!id) {
    throw Error("ID must be provided");
  }
  if (!ObjectId.isValidObjectId(id)) {
    throw Error("Not a valid product ID");
  }
  const product = await this.findOne({ _id: id });
  if (!product) {
    throw Error("No product with the given ID");
  }
  return product;
};
productSchema.statics.allProducts = async function () {
  const products = await this.find({});
  return products;
};
productSchema.statics.writeReview = async function (
  productId,
  reviewName,
  rating,
  reviewDesc,
  postedOn
) {
  if (!productId) {
    throw Error("Product ID required");
  }
  if (!reviewName) {
    throw Error("Reviw Name required");
  }
  if (!rating) {
    throw Error("Rating required");
  }
  if (!reviewDesc) {
    throw Error("Review description required");
  }
  if (!postedOn) {
    throw Error("Posted on required");
  }
  if (!ObjectId.isValidObjectId(productId)) {
    throw Error("Enter a valid Product ID type Object");
  }
  const exists = await this.findOne({ _id: productId });
  if (!exists) {
    throw Error("No product found");
  }
  await this.updateOne(
    { _id: productId },
    {
      $push: {
        reviews: {
          reviewName,
          rating,
          reviewDesc,
          postedOn,
        },
      },
    }
  );
  const product = await this.findOne({ _id: productId });
  return product;
};
productSchema.statics.nameSearch = async function (name) {
  if (!name) {
    throw Error("Enter a search field parameter");
  }
  const product = await this.find({
    $text: { $search: name },
    $text: { $search: name },
  });
  console.log(product);
  return product;
};
productSchema.statics.filterProducts = async function (
  dressType,
  maxPrice,
  gender,
  color,
  dressStyle,
  sort
) {
  //sorting function
  function sortingObject(string) {
    if (!string) {
      return { createdAt: -1 };
    }
    if (string == "new") {
      return { createdAt: -1 };
    }
    if (string == "old") {
      return { createdAt: 1 };
    }
    if (string == "highPrice") {
      return { discountPrice: -1 };
    }
    if (string == "lowPrice") {
      return { discountPrice: 1 };
    }
    if (string == "highRating") {
      return { avgRating: -1 };
    }
    if (string == "lowRating") {
      return { avgRating: 1 };
    }
    if (string == "highDiscount") {
      return { discount: -1 };
    }
    if (string == "lowDiscount") {
      return { discount: 1 };
    }
    return { createdAt: -1 };
  }
  const sortBy = sortingObject(sort);
  //only one filter
  if (dressType && !maxPrice && !gender && !color && !dressStyle) {
    return await this.find({ dressType }).sort(sortBy);
  }
  if (maxPrice && !dressType && !gender && !color && !dressStyle) {
    return await this.find({ discountPrice: { $lte: maxPrice } }).sort(sortBy);
  }
  if (gender && !dressType && !maxPrice && !color && !dressStyle) {
    return await this.find({ gender }).sort(sortBy);
  }
  if (color && !dressType && !maxPrice && !gender && !dressStyle) {
    return await this.find({ colors: color }).sort(sortBy);
  }
  if (dressStyle && !dressType && !maxPrice && !gender && !color) {
    return await this.find({ dressStyle }).sort(sortBy);
  }
  //two filters
  if (dressType && maxPrice && !gender && !color && !dressStyle) {
    return await this.find({
      dressType,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  if (gender && maxPrice && !dressType && !color && !dressStyle) {
    return await this.find({ gender, discountPrice: { $lte: maxPrice } }).sort(
      sortBy
    );
  }
  if (dressType && gender && !maxPrice && !color && !dressStyle) {
    return await this.find({ dressType, gender }).sort(sortBy);
  }
  if (dressType && color && !maxPrice && !gender && !dressStyle) {
    return await this.find({ dressType, colors: color }).sort(sortBy);
  }
  if (maxPrice && color && !dressType && !gender && !dressStyle) {
    return await this.find({
      colors: color,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  if (gender && color && !dressType && !maxPrice && !dressStyle) {
    return await this.find({ colors: color, gender }).sort(sortBy);
  }
  if (dressStyle && dressType && !color && !maxPrice && !gender) {
    return await this.find({ dressStyle, dressType }).sort(sortBy);
  }
  if (dressStyle && maxPrice && !dressType && !color && !gender) {
    return await this.find({
      dressStyle,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  if (dressStyle && gender && !dressType && !color && !maxPrice) {
    return await this.find({ dressStyle, gender }).sort(sortBy);
  }
  if (dressStyle && color && !dressType && !maxPrice && !gender) {
    return await this.find({ dressStyle, colors: color }).sort(sortBy);
  }
  //three filters applied
  if (dressType && maxPrice && gender && !color && !dressStyle) {
    return await this.find({
      gender,
      discountPrice: { $lte: maxPrice },
      dressType,
    }).sort(sortBy);
  }
  if (!dressType && maxPrice && gender && color && !dressStyle) {
    return await this.find({
      gender,
      discountPrice: { $lte: maxPrice },
      colors: color,
    }).sort(sortBy);
  }
  if (dressType && !maxPrice && gender && color && !dressStyle) {
    return await this.find({
      gender,
      dressType,
      colors: color,
    }).sort(sortBy);
  }
  if (dressType && maxPrice && !gender && color && !dressStyle) {
    return await this.find({
      discountPrice: { $lte: maxPrice },
      dressType,
      colors: color,
    }).sort(sortBy);
  }
  if (!dressType && !maxPrice && gender && color && dressStyle) {
    return await this.find({
      gender,
      dressStyle,
      colors: color,
    }).sort(sortBy);
  }
  if (dressType && !maxPrice && !gender && color && dressStyle) {
    return await this.find({
      dressType,
      dressStyle,
      colors: color,
    }).sort(sortBy);
  }
  if (dressType && maxPrice && !gender && !color && dressStyle) {
    return await this.find({
      dressType,
      dressStyle,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  if (!dressType && maxPrice && !gender && color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  if (dressType && !maxPrice && gender && !color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      gender,
    }).sort(sortBy);
  }
  if (!dressType && maxPrice && !gender && color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      discountPrice: { $lte: maxPrice },
    }).sort(sortBy);
  }
  //four field filter
  if (!dressType && maxPrice && gender && color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      discountPrice: { $lte: maxPrice },
      gender,
    }).sort(sortBy);
  }
  if (dressType && !maxPrice && gender && color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      dressType,
      gender,
    }).sort(sortBy);
  }
  if (dressType && maxPrice && !gender && color && dressStyle) {
    return await this.find({
      colors: color,
      dressStyle,
      discountPrice: { $lte: maxPrice },
      dressType,
    }).sort(sortBy);
  }
  if (dressType && maxPrice && gender && !color && dressStyle) {
    return await this.find({
      dressType,
      dressStyle,
      discountPrice: { $lte: maxPrice },
      gender,
    }).sort(sortBy);
  }
  if (dressType && maxPrice && gender && color && !dressStyle) {
    return await this.find({
      dressType,
      colors: color,
      discountPrice: { $lte: maxPrice },
      gender,
    }).sort(sortBy);
  }
  //if all filters applied
  if (dressType && maxPrice && gender && color && dressStyle) {
    return await this.find({
      dressType,
      discountPrice: { $lte: maxPrice },
      gender,
      colors: color,
      dressStyle,
    }).sort(sortBy);
  }
  //if no value given return all products
  if (!dressType && !maxPrice && !gender && !color && !dressStyle) {
    return await this.find().sort(sortBy);
  }
};
productSchema.statics.getDistinctDressType = async function () {
  const dressType = await this.distinct("dressType");
  const colors = await this.distinct("colors");
  const maxPrice = (await this.find().sort({ discountPrice: -1 }).limit(1))[0]
    .discountPrice;
  return (product = { dressType, maxPrice, colors });
};

module.exports = mongoose.model("Products", productSchema);
