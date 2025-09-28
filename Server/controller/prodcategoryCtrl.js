const Category = require("../models/Category");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title, subcategories } = req.body;

    // Ensure subcategories are objects
    const formattedSubcategories =
      subcategories?.map((subcategory) =>
        typeof subcategory === "string" ? { title: subcategory } : subcategory
      ) || [];
     const createdBy = req.user._id;
    const newCategory = await Category.create({
      title,
      subcategories: formattedSubcategories,
      createdBy,
    });

    res.json(newCategory);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: " Category already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});


const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const { title, subcategories } = req.body;

    // Ensure subcategories are objects
    const formattedSubcategories =
      subcategories?.map((subcategory) =>
        typeof subcategory === "string" ? { title: subcategory } : subcategory
      ) || [];

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { title, subcategories: formattedSubcategories }, // Use formatted subcategories
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
});


// Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Get a single category by ID
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaCategory = await Category.findById(id);
    res.json(getaCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Get all categories
const getallCategory = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let categories;

    if (role === "admin") {
      categories = await Category.find({ createdBy: _id }).populate("title");
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("Pos  Login not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("Pos has no assigned admin");
      }

      categories = await Category.find({ createdBy: adminId }).populate("title");
    }
    else if (role === "grn") {
      const grn = await User.findById(_id);
      if (!grn) {
        res.status(404);
        throw new Error("GRN  Login not found");
      }

      const adminId =grn.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("GRN has no assigned admin");
      }

      categories = await Category.find({ createdBy: adminId }).populate("title");
    }
     else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(categories);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
});

const CategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { status: !category.status },
    { new: true }
  );

  res.json({ data: updated });
});


const SubcategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId, subcategoryIndex } = req.params;
  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const index = parseInt(subcategoryIndex, 10);

  const sub = category.subcategories[index];
  if (!sub) {
    return res.status(404).json({ message: "Subcategory not found" });
  }

  sub.status = !sub.status;
  await category.save();

  res.json({ data: category });
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  CategoryStatus,
  SubcategoryStatus,
};
