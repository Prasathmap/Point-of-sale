const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const port = process.env.PORT || 4000;
const cookieParser =require("cookie-parser");

dotenv.config();

//routes
// const categoryRouter = require("./routes/categories.js");
const productRouter = require("./routes/productRoute.js");
const invoiceRoute = require("./routes/invoiceRoutes.js");
const authRoute = require("./routes/auth.js");
const logoRoute = require("./routes/logo.js");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const brandRouter = require("./routes/brandRoute");
const attenderRouter = require("./routes/attenderRoute");
const taxRouter = require("./routes/taxRoute");
const unitRouter = require("./routes/unitRoute");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

//middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
})
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/invoices", invoiceRoute);
app.use("/api/logo", logoRoute);
app.use("/api/brand", brandRouter);
app.use("/api/attender", attenderRouter);
app.use("/api/tax", taxRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/unit", unitRouter);
app.use("/api/coupon", couponRouter);

app.listen(port, () => {
  connect();
  console.log(`Listening on port ${port}`);
});
