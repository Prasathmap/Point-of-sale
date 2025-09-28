const Inventory = require('../models/GrnModel');
const User = require("../models/UserModel");
const Good = require("../models/GoodsModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const mongoose = require('mongoose');

const getNextInventoryNumber = async (adminId) => {
  const lastInventory = await Inventory.findOne({ createdBy: adminId })
    .sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastInventory && lastInventory.grnno) {
    const match = lastInventory.grnno.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${String(nextNumber).padStart(4, '0')}`;
};


const InventoryNumber = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    const GrnNo = await getNextInventoryNumber(adminId);
    res.status(200).json({ GrnNo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create inventory entry
const createInventory = asyncHandler(async (req, res) => {
 try {
    const { user } = req; 
    
    const inventoryData = {
      ...req.body,
      createdBy: user._id,
      status: 'pending',
    };

    const inventory = await Inventory.create(inventoryData);
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const updateInventory = asyncHandler(async (req, res) => {
    const updates = req.body; // should be an array

  if (!Array.isArray(updates)) {
    res.status(400);
    throw new Error("Expected an array of updates");
  }

  const results = [];
  const skippedItems = [];

  for (const item of updates) {
    const { productId, variant, quantity, action } = item;

    if (!productId || !variant || !quantity || !action) {
      console.warn("Skipped invalid item:", item);
      skippedItems.push(item);
      continue;
    }

    try {
      // Convert productId to ObjectId if needed
      const productObjId = mongoose.Types.ObjectId.isValid(productId) 
        ? new mongoose.Types.ObjectId(productId)
        : productId;

      // Find the inventory document containing this product
      const inventory = await Inventory.findOne({
        "items.productId": productObjId,
        "items.variants.variant": variant
      });

      if (!inventory) {
        skippedItems.push({ ...item, error: "Product variant not found" });
        continue;
      }

      // Find the specific item and variant
      const itemIndex = inventory.items.findIndex(
        item => item.productId.equals(productObjId)
      );
      
      const variantIndex = inventory.items[itemIndex].variants.findIndex(
        v => v.variant === variant
      );

      // Update the quantity
      if (action === "decrement") {
        inventory.items[itemIndex].variants[variantIndex].quantity -= quantity;
      } else {
        inventory.items[itemIndex].variants[variantIndex].quantity += quantity;
      }

      // Save the updated document
      await inventory.save();

      results.push({
        productId,
        variant,
        newQuantity: inventory.items[itemIndex].variants[variantIndex].quantity
      });

    } catch (error) {
      console.error("Error updating item:", item, error);
      skippedItems.push({
        ...item,
        error: error.message
      });
    }
  }

  res.status(200).json({ 
    message: "Inventory update processed",
    results,
    skippedItems: skippedItems.length > 0 ? skippedItems : undefined
  });
});

const getInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaInventory = await Inventory.findById(id);
    res.json(getaInventory);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllInventory = asyncHandler(async (req, res) => {
    try {
      const { _id, role } = req.user;
      let baseMatch = {};
  
      if (role === "admin") {
        // Get all attenders created by this admin
        const attenders = await User.find({ createdBy: _id }).select("_id");
        const attenderIds = attenders.map((attender) => attender._id);
  
        baseMatch.createdBy = { $in: [_id, ...attenderIds] };
      } else if (role === "grn") {
        baseMatch.createdBy = _id;
      } 
      else if (role === "pos") {
      const currentUser = await User.findById(_id).select("createdBy");
      const adminId = currentUser?.createdBy;

      if (!adminId) {
        res.status(403);
        throw new Error("POS user has no associated admin");
      }

      // Step 2: Get all GRN users created by this admin
      const grnUsers = await User.find({ role: "grn", createdBy: adminId }).select("_id");
      const grnUserIds = grnUsers.map((user) => user._id);

      // Step 3: Match inventories created by those GRN users
      baseMatch.createdBy = { $in: grnUserIds };
    }

      else {
        res.status(403);
        throw new Error("Unauthorized access");
      }
  
      const inventory = await Inventory.find(baseMatch);
  
      res.json(inventory);
    } catch (error) {
      console.error("Error in getAllInventory:", error);
      res.status(500).json({ message: error.message });
    }
  });
  

// Delete inventory entry
const deleteInventory = asyncHandler(async (req, res) => {
 const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedExpance = await Inventory.findByIdAndDelete(id);
    res.json(deletedExpance);
  } catch (error) {
    throw new Error(error);
  }
});


const approvalInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    // Update inventory status and receiver note
    inventory.status = req.body.status || inventory.status;
    inventory.Receivernote = req.body.Receivernote || inventory.Receivernote;
    await inventory.save();

    if (req.body.status === "approved" && Array.isArray(inventory.items)) {
      for (const item of inventory.items) {
        const product = await Product.findById(item.productId).lean();

        // ✅ Extract variantId and variantName
        const variantId = item.variants?.[0]?.variantId || null;
        const variantName = item.variants?.[0]?.variant?.toString() || "default";

        // Determine quantity to add
        const qty = item.quantity || item.receivedCount || 0;
        if (qty <= 0) continue;

        // Use consistent variant match (with both productId + variantId if available)
        let existingGood = await Good.findOne({
          productId: item.productId,
          variantId: variantId,
          createdBy: req.user._id
        });

        if (existingGood) {
          // Update counts
          existingGood.receivedCount += qty;
          existingGood.handInCount += qty;
          await existingGood.save();
        } else {
          // Create new Good
          await Good.create({
            productId: item.productId,
            title: product ? product.title : "Unknown Product",
            variantId: variantId,
            variant: variantName,
            receivedCount: qty,
            handInCount: qty,
            createdBy: req.user._id
          });
        }
      }
    }

    res.json({ inventory, message: "Inventory approved successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


const updatestock = asyncHandler(async (req, res) => {
  const updates = req.body; // should be an array

  if (!Array.isArray(updates)) {
    res.status(400);
    throw new Error("Expected an array of updates");
  }

  const results = [];
  const skippedItems = [];

  for (const item of updates) {
    const { productId, variant, quantity, action } = item;

    if (!productId || !variant || !quantity || !action) {
      console.warn("Skipped invalid item:", item);
      skippedItems.push(item);
      continue;
    }

    try {
      // Convert productId to ObjectId if needed
      const productObjId = mongoose.Types.ObjectId.isValid(productId) 
        ? new mongoose.Types.ObjectId(productId)
        : productId;

      // Find the inventory document containing this product
     const cleanVariant = String(variant).trim();
      const inventory = await Inventory.findOne({
        "items.productId": productObjId,
        "items.variants.variant": cleanVariant
      });

      if (!inventory) {
        skippedItems.push({ ...item, error: "Product variant not found" });
        continue;
      }

      // Find the specific item and variant
      const itemIndex = inventory.items.findIndex(
        i => i.productId.equals(productObjId)
      );

      const variantIndex = inventory.items[itemIndex].variants.findIndex(
        v => String(v.variant).trim() === cleanVariant
      );

      // Update the quantity
      if (action === "decrement") {
        inventory.items[itemIndex].variants[variantIndex].quantity -= quantity;
      } else {
        inventory.items[itemIndex].variants[variantIndex].quantity += quantity;
      }


      // Save the updated document
      await inventory.save();

      results.push({
        productId,
        variant,
        newQuantity: inventory.items[itemIndex].variants[variantIndex].quantity
      });

    } catch (error) {
      console.error("Error updating item:", item, error);
      skippedItems.push({
        ...item,
        error: error.message
      });
    }
  }

  res.status(200).json({ 
    message: "Inventory update processed",
    results,
    skippedItems: skippedItems.length > 0 ? skippedItems : undefined
  });
});

module.exports = {
  InventoryNumber,
  createInventory,
  updateInventory,
  getInventory,
  getAllInventory,
  deleteInventory,
  approvalInventory,
  updatestock,
};