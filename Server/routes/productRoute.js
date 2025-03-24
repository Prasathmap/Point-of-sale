const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  allProduct,
  updateProduct,
  deleteProduct,
  updateSoldCount,
  blockProduct,
  unblockProduct,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/:id",authMiddleware, getaProduct);
router.patch("/update-sold", updateSoldCount);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/block-product/:id",isAdmin, blockProduct);
router.put("/unblock-product/:id",isAdmin, unblockProduct);
router.get("/", getAllProduct);
router.get("/all", allProduct);


module.exports = router;
