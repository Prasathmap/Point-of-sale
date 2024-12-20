const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const port = process.env.PORT || 4000;

dotenv.config();

//routes
const categoryRoute = require("./routes/categories.js");
const productRoute = require("./routes/products.js");
const invoiceRoute = require("./routes/invoices.js");
const authRoute = require("./routes/auth.js");
const userRoute = require("./routes/users.js");
const logoRoute = require("./routes/logo.js");

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
  origin: 'https://mapit-eta.vercel.app',
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use((req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend-domain.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Allow preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond to preflight request
  }

  next(); // Continue to the next middleware/route handler
});

app.get('/', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
})


app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/invoices", invoiceRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/logo", logoRoute);

app.listen(port, () => {
  connect();
  console.log(`Listening on port ${port}`);
});
