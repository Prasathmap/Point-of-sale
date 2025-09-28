const Good = require("../models/GoodsModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const mongoose = require('mongoose');
const getAllGoods = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        const getAllGoods = await Good.find({ createdBy: _id });
        res.json(getAllGoods);
      } catch (error) {
        throw new Error(error);
      }
  });


const updatestock = asyncHandler(async (req, res) => {
  const updates = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: "Expected an array of updates" });
  }

  const results = [];
  const errors = [];

  for (const item of updates) {
    const { productId, variantId, variant, quantity, action } = item;

    if ((!variantId && !productId) || !quantity || !action) {
      errors.push({ item, error: "Missing required fields" });
      continue;
    }

    try {
      let good = null;

      // 1️⃣ Try variantId as ObjectId
      if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
        good = await Good.findOne({
          variantId: new mongoose.Types.ObjectId(variantId),
          variant: String(variant).trim()
        });
      }

      // 2️⃣ Try variantId as string
      if (!good && variantId) {
        good = await Good.findOne({
          variantId: variantId,
          variant: String(variant).trim()
        });
      }

      // 3️⃣ Fallback to productId + variant
      if (!good && productId) {
        good = await Good.findOne({
          productId: productId,
          variant: String(variant).trim()
        });
      }

      // 4️⃣ Case-insensitive fallback
      if (!good && productId) {
        good = await Good.findOne({
          productId: productId,
          variant: { $regex: new RegExp(`^${String(variant).trim()}$`, "i") }
        });
      }

      if (!good) {
        console.log("Product not found:", { productId, variantId, variant });
        errors.push({ item, error: "Product not found" });
        continue;
      }

      // ✅ Update stock
      if (action === "decrement") {
        good.handInCount = (good.handInCount || 0) - quantity;
        if (good.handInCount < 0) good.handInCount = 0;
      } else if (action === "increment") {
        good.handInCount = (good.handInCount || 0) + quantity;
      }

      await good.save();
      results.push({
        ...good.toObject(),
        action,
        updatedQuantity: quantity
      });

    } catch (error) {
      errors.push({ item, error: error.message });
    }
  }

  res.json({
    success: results,
    errors,
    message: `Processed ${updates.length} items: ${results.length} successful, ${errors.length} failed`
  });
});


  module.exports = {
    getAllGoods,
    updatestock,
  };