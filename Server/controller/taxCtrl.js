const Tax = require("../models/taxModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createTax = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newTax = await Tax.create(req.body);
    res.json(newTax);
  } catch (error) {
    throw new Error(error);
  }
});
const updateTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedTax = await Tax.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedTax);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedTax = await Tax.findByIdAndDelete(id);
    res.json(deletedTax);
  } catch (error) {
    throw new Error(error);
  }
});
const getTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaTax = await Tax.findById(id);
    res.json(getaBrand);
  } catch (error) {
    throw new Error(error);
  }
});
const getallTax = asyncHandler(async (req, res) => {
  try {
    const getallTax = await Tax.find();
    res.json(getallTax);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createTax,
  updateTax,
  deleteTax,
  getTax,
  getallTax,
};
