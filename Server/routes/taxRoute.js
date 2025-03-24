const express = require("express");
const {
  createTax,
  updateTax,
  deleteTax,
  getTax,
  getallTax,
} = require("../controller/taxCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createTax);
router.put("/:id", authMiddleware, isAdmin, updateTax);
router.delete("/:id", authMiddleware, isAdmin, deleteTax);
router.get("/:id", getTax);
router.get("/", getallTax);

module.exports = router;
