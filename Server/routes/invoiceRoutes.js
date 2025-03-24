const express = require("express");
const router = express.Router();
const {
  InvoiceNumber,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getYearlyTotalOrder,
  getTodayData,
  getMonthWiseOrderIncome,
} = require("../controller/invoiceCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// Routes
router.post("/", createInvoice);
router.get("/bill-no", InvoiceNumber);
router.get("/get-all", getAllInvoices);

// Static routes should come before dynamic routes
router.get("/getyearlyorders", authMiddleware, isAdmin, getYearlyTotalOrder);
router.get("/getMonthWiseOrderIncome", getMonthWiseOrderIncome);
router.get("/getTodayorders", getTodayData);

// Dynamic routes (like `/:id`) should come after static routes
router.get("/:id", getInvoiceById);
router.put("/:id", authMiddleware, isAdmin, updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;