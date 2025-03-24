const express = require("express");
const {
  createAttender,
  updateAttender,
  deleteAttender,
  getAttender,
  getallAttender,
  loginAttender,
} = require("../controller/attenderCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", loginAttender);
router.post("/", authMiddleware, isAdmin, createAttender);
router.put("/:id", authMiddleware, isAdmin, updateAttender);
router.delete("/:id", authMiddleware, isAdmin, deleteAttender);
router.get("/:id", getAttender);
router.get("/", getallAttender);

module.exports = router;
