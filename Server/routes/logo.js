const express = require("express");
const multer = require("multer");
const path = require("path");
const Logo = require("../models/logo");

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to `uploads/` folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload Route
router.post("/upload", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save file info to the database
    const newLogo = new Logo({
      fileName: req.file.filename,
    });

    const savedLogo = await newLogo.save();

    res.status(200).json({
      message: "Logo uploaded successfully",
      fileName: savedLogo.fileName,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/latest", async (req, res) => {
  try {
    const latestLogo = await Logo.findOne().sort({ createdAt: -1 }); // Fetch the latest logo
    if (latestLogo) {
      res.status(200).json({ fileName: latestLogo.fileName });
    } else {
      res.status(404).json({ message: "No logo found" });
    }
  } catch (error) {
    console.error("Error fetching latest logo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
