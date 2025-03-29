const express = require("express");
const router = express.Router();
const foryouController = require("../controllers/foryouController");

// Chỉ giữ route GET / để lấy danh sách món ăn đã lọc
router.get("/:userId", foryouController.getForyou);
router.post("/", foryouController.createForyou);
router.put("/:id", foryouController.updateForyou);
router.delete("/:id", foryouController.deleteForyou);

module.exports = router;
