const express = require('express');
const {
  createInventory,updateInventory,
  getInventory,
  getAllInventory,
  deleteInventory,InventoryNumber,approvalInventory,updatestock,
} = require("../controller/inventoryController");
const { authMiddleware, } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/Grn-no",authMiddleware, InventoryNumber);
router.post("/", authMiddleware, createInventory);
router.put("/:id", authMiddleware,  updateInventory);
router.get("/:id",authMiddleware, getInventory);
router.get("/", authMiddleware,  getAllInventory);
router.delete('/:id',authMiddleware, deleteInventory);
router.put('/approval/:id', authMiddleware,approvalInventory);
router.put('/update-stock', authMiddleware,updatestock);


module.exports = router;
