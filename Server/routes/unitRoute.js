const express = require("express");
const {
  createUnit,
  updateUnit,
  deleteUnit,
  getUnit,
  getallUnit,
} = require("../controller/unitCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createUnit);
router.put("/:id", authMiddleware, isAdmin, updateUnit);
router.delete("/:id", authMiddleware, isAdmin, deleteUnit);
router.get("/:id", getUnit);
router.get("/", getallUnit);

module.exports = router;
