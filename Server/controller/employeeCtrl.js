const Employee = require("../models/EmployeeModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const validateMongoDbId = require("../utils/validateMongodbId");

const create = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId; 
    const newAttender = await Employee.create(req.body);
    res.json(newAttender);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue).join(', ');
     return res.status(400).json({ message: `Duplicate entry for: ${field}` });
    }
     res.status(500).json({ message: error.message });
  }
});
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedAttender = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const Delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedAttender = await Employee.findByIdAndDelete(id);
    res.json(deletedAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const getid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaAttender = await Employee.findById(id);
    res.json(getaAttender);
  } catch (error) {
    throw new Error(error);
  }
});
const getall = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let salestype;

    if (role === "admin") {
      salestype = await Employee.find({ createdBy: _id }).populate("title");
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("pos not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("pos has no assigned admin");
      }

      salestype = await Employee.find({ createdBy: adminId }).populate("title");
    } else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(salestype);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
});
const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "employee not found" });
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      { status: !employee.status }, 
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling employee status:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  create,
  update,
  Delete,
  getid,
  getall,
  getstatus,
};
