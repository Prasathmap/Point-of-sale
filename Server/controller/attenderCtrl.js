const Attender = require("../models/attenderModel");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken, generateToken } = require("../utils/tokenUtils");
const validateMongoDbId = require("../utils/validateMongodbId");

const createAttender = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId; 
    const newAttender = await Attender.create(req.body);
    res.json(newAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const updateAttender = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedAttender = await Attender.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteAttender = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedAttender = await Attender.findByIdAndDelete(id);
    res.json(deletedAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const getAttender = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaAttender = await Attender.findById(id);
    res.json(getaAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const getallAttender = asyncHandler(async (req, res) => {
  try {
    const getallAttender = await Attender.find();
    res.json(getallAttender);
  } catch (error) {
    throw new Error(error);
  }
});

const loginAttender = asyncHandler(async (req, res) => {
  const { phone, empcode } = req.body;

  try {
    const user = await Attender.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    if (user.empcode !== empcode) {
      return res.status(401).json({ error: "Invalid employee code!" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = {
  createAttender,
  updateAttender,
  deleteAttender,
  getAttender,
  getallAttender,
  loginAttender,
};
