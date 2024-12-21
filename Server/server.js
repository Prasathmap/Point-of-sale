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
const corsOptions = {
    origin: 'https://mapit-eta.vercel.app', // Allow this frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://mapit-eta.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        res.status(200).end();
        return;
    }

    // Your API logic here
}

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
