require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const loginroutes = require("./routes/loginSignup");
const productRoutes = require("./routes/productRoutesd");
const authRoutes = require("./routes/authRoutes");
const homeRoute = require("./routes/homeRoute");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use("/api", loginroutes);
app.use("/api/product", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/home", homeRoute);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("App listining at port " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
