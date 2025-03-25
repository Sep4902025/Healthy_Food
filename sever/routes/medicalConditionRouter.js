const express = require("express");
const medicalConditionRouter = express.Router();
const { isAuthenticated, isNutritionist } = require("../middlewares/isAuthenticated");

const {
  createMedicalCondition,
  updateMedicalCondition,
  getMedicalConditionById,
  getAllMedicalConditions,
  deleteMedicalCondition,
  searchMedicalConditionByName,
} = require("../controllers/medicalConditionController");

medicalConditionRouter.post("/",isAuthenticated, isNutritionist, createMedicalCondition); // Tạo mới Medical Condition
medicalConditionRouter.get("/", getAllMedicalConditions); // Lấy tất cả Medical Conditions
medicalConditionRouter.get("/search", searchMedicalConditionByName); // Tìm kiếm theo tên
medicalConditionRouter.get("/:conditionId", getMedicalConditionById); // Lấy theo ID
medicalConditionRouter.put("/:conditionId",isAuthenticated, isNutritionist, updateMedicalCondition); // Cập nhật Medical Condition
medicalConditionRouter.delete("/:conditionId",isAuthenticated, isNutritionist, deleteMedicalCondition); // Xóa cứng Medical Condition

module.exports = medicalConditionRouter;
