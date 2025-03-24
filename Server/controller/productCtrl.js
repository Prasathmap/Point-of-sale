const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");


const createProduct = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id; // Get admin ID from authenticated user
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    req.body.createdBy = adminId; // Store the admin ID

    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// Get all categories
const allProduct = asyncHandler(async (req, res) => {
  try {
    const allProduct = await Product.find();
    res.json(allProduct);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const updateSoldCount = async (productId, quantitySold) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Ensure there is enough quantity available
    if (product.quantity < quantitySold) {
      throw new Error("Not enough stock available");
    }

    product.quantity -= quantitySold;
    product.sold += quantitySold;

    await product.save();
    return product;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const blockProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockproduct = await Product.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockproduct);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await Product.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "Product UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  allProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  updateSoldCount,
  blockProduct,
  unblockProduct,
};
