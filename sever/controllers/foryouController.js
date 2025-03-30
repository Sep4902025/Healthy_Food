const Dish = require("../models/Dish");
const MedicalCondition = require("../models/MedicalCondition");
const UserModel = require("../models/UserModel");
const UserPreferenceModel = require("../models/UserPrefenrenceModel"); // Giữ nguyên lỗi chính tả
const Recipe = require("../models/Recipe"); // Thêm import cho Recipe

const foryouController = {
  getForyou: async (req, res) => {
    try {
      const userId = req.user?.id || req.params.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId là bắt buộc!",
        });
      }

      const user = await UserModel.findOne({
        _id: userId,
        isDelete: false,
        isBan: false,
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng!",
        });
      }

      const userPreferenceId = user.userPreferenceId;
      if (!userPreferenceId) {
        return res.status(404).json({
          success: false,
          message:
            "Người dùng chưa có sở thích (userPreferenceId) được thiết lập!",
        });
      }

      const userPreference = await UserPreferenceModel.findOne({
        _id: userPreferenceId,
        userId: userId,
        isDelete: false,
      }).populate("underDisease");
      if (!userPreference) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sở thích người dùng!",
        });
      }

      const underDiseases = userPreference.underDisease || [];
      const hateIngredients = userPreference.hate || [];

      // Trường hợp không có điều kiện y tế hoặc nguyên liệu ghét
      if (underDiseases.length === 0 && hateIngredients.length === 0) {
        const foryouItems = await Dish.find({
          isVisible: true,
          isDelete: false,
        })
          .populate("recipeId")
          .populate("medicalConditionId");

        return res.status(200).json({
          success: true,
          message:
            "Danh sách món ăn được lấy thành công (không có điều kiện y tế hoặc ghét)",
          data: foryouItems,
        });
      }

      // Lấy danh sách điều kiện y tế và các món bị hạn chế/khuyến nghị
      const medicalConditions = await MedicalCondition.find({
        _id: { $in: underDiseases },
        isDelete: false,
      })
        .populate("restrictedFoods")
        .populate("recommendedFoods");

      const restrictedFoods = medicalConditions
        .flatMap((condition) => condition.restrictedFoods)
        .map((dish) => dish._id.toString());

      const recommendedFoods = medicalConditions
        .flatMap((condition) => condition.recommendedFoods)
        .map((dish) => dish._id.toString());

      const nutritionalConstraints = medicalConditions.reduce(
        (acc, condition) => {
          if (condition.nutritionalConstraints) {
            if (condition.nutritionalConstraints.carbs)
              acc.carbs = Math.min(
                acc.carbs || Infinity,
                condition.nutritionalConstraints.carbs
              );
            if (condition.nutritionalConstraints.fat)
              acc.fat = Math.min(
                acc.fat || Infinity,
                condition.nutritionalConstraints.fat
              );
            if (condition.nutritionalConstraints.protein)
              acc.protein = Math.min(
                acc.protein || Infinity,
                condition.nutritionalConstraints.protein
              );
            if (condition.nutritionalConstraints.calories)
              acc.calories = Math.min(
                acc.calories || Infinity,
                condition.nutritionalConstraints.calories
              );
          }
          return acc;
        },
        {}
      );

      // Xử lý nguyên liệu bị ghét và công thức bị hạn chế
      let restrictedRecipeIds = [];
      if (hateIngredients.length > 0) {
        const recipesWithHatedIngredients = await Recipe.find({
          "ingredients.ingredientId": { $in: hateIngredients },
        });
        restrictedRecipeIds = recipesWithHatedIngredients.map((recipe) =>
          recipe._id.toString()
        );
      }

      // Truy vấn món ăn với điều kiện
      const query = {
        isVisible: true,
        isDelete: false,
        _id: { $nin: restrictedFoods },
        $or: [
          { recipeId: { $nin: restrictedRecipeIds } }, // Công thức không bị hạn chế
          { recipeId: { $exists: false } }, // Hoặc không có recipeId
        ],
      };

      if (nutritionalConstraints.carbs)
        query.carbs = { $lte: nutritionalConstraints.carbs };
      if (nutritionalConstraints.fat)
        query.fat = { $lte: nutritionalConstraints.fat };
      if (nutritionalConstraints.protein)
        query.protein = { $lte: nutritionalConstraints.protein };
      if (nutritionalConstraints.calories)
        query.calories = { $lte: nutritionalConstraints.calories };

      const foryouItems = await Dish.find(query)
        .populate("recipeId")
        .populate("medicalConditionId");

      // Sắp xếp ưu tiên món ăn được khuyến nghị
      const sortedItems = foryouItems.sort((a, b) => {
        const aIsRecommended = recommendedFoods.includes(a._id.toString());
        const bIsRecommended = recommendedFoods.includes(b._id.toString());
        return bIsRecommended - aIsRecommended;
      });

      if (sortedItems.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Không tìm thấy món ăn nào khớp với tiêu chí",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Danh sách món ăn được lấy thành công dựa trên điều kiện y tế và sở thích",
        data: sortedItems,
      });
    } catch (error) {
      console.error("Lỗi trong getForyou:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách món ăn",
        error: error.message,
      });
    }
  },

  createForyou: async (req, res) => {
    try {
      const {
        name,
        description,
        imageUrl,
        videoUrl,
        recipeId,
        medicalConditionId,
        cookingTime,
        calories,
        protein,
        carbs,
        fat,
        totalServing,
        flavor,
        type,
        season,
      } = req.body;

      const newForyou = new Dish({
        name,
        description,
        imageUrl,
        videoUrl,
        recipeId,
        medicalConditionId,
        cookingTime,
        calories,
        protein,
        carbs,
        fat,
        totalServing,
        flavor,
        type,
        season,
      });

      const savedForyou = await newForyou.save();

      return res.status(201).json({
        success: true,
        message: "Foryou item created successfully",
        data: savedForyou,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error creating foryou item",
        error: error.message,
      });
    }
  },

  updateForyou: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedForyou = await Dish.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: Date.now() },
        { new: true, runValidators: true }
      );

      if (!updatedForyou) {
        return res.status(404).json({
          success: false,
          message: "Foryou item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Foryou item updated successfully",
        data: updatedForyou,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error updating foryou item",
        error: error.message,
      });
    }
  },

  deleteForyou: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedForyou = await Dish.findByIdAndUpdate(
        id,
        { isDelete: true },
        { new: true }
      );

      if (!deletedForyou) {
        return res.status(404).json({
          success: false,
          message: "Foryou item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Foryou item deleted successfully",
        data: deletedForyou,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error deleting foryou item",
        error: error.message,
      });
    }
  },
};

module.exports = foryouController;
