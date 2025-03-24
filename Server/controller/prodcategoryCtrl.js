const Category = require("../models/Category");
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
    console.error(error);
    throw new Error(error.message);
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
    const getallCategory = await Category.find();
    res.json(getallCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
};
