const express = require('express');
const {
  getAllGoods,updatestock,
} = require("../controller/goodsCtrl");
const { authMiddleware, } = require("../middlewares/authMiddleware");

const router = express.Router();


router.get("/", authMiddleware, getAllGoods);
router.put("/handin",authMiddleware, updatestock);


module.exports = router;
