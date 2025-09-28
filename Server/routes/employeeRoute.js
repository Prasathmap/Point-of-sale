const express = require("express");
const {
  create,
  update,
  Delete,
  getid,
  getall,getstatus,
} = require("../controller/employeeCtrl");
const { authMiddleware, isAdmin, } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, create);
router.put("/:id", authMiddleware, isAdmin, update);
router.delete("/:id", authMiddleware, isAdmin, Delete);
router.get("/:id", getid);
router.get("/",authMiddleware, getall);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
