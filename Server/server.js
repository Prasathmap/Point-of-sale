const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// MongoDB Connection (Lazy Connect to Prevent Cold Start Issues)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// Routes
const categoryRouter = require("./routes/categories.js");
const productRouter = require("./routes/productRoute.js");
const invoiceRoute = require("./routes/invoiceRoutes.js");
const authRoute = require("./routes/auth.js");
const userRoute = require("./routes/users.js");
const logoRoute = require("./routes/logo.js");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const brandRouter = require("./routes/brandRoute");
const attenderRouter = require("./routes/attenderRoute");
const taxRouter = require("./routes/taxRoute");
const unitRouter = require("./routes/unitRoute");

app.get("/", (req, res) => {
  res.status(200).json("Welcome, your app is working well");
});

app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/invoices", invoiceRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/logo", logoRoute);
app.use("/api/brand", brandRouter);
app.use("/api/attender", attenderRouter);
app.use("/api/tax", taxRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/unit", unitRouter);

// Export API handler for Vercel
module.exports = async (req, res) => {
  await connectDB(); // Ensure DB is connected before handling requests
  return app(req, res);
};
