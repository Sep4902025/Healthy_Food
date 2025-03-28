import React, { useState } from "react";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import UploadComponent from "../../../components/UploadComponent";

const TYPE_OPTIONS = [
  "Meat & Seafood",
  "Vegetables & Roots",
  "Spices & Herbs",
  "Grains & Beans",
  "Eggs & Dairy",
  "Dried & Processed Ingredients",
  "Others",
];

const AddIngredient = ({ onIngredientAdded = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    type: "",
    customType: "",
    season: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    nutritionalInfo: "",
    unit: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required!";
    if (!formData.description.trim()) newErrors.description = "Description is required!";
    if (!formData.imageUrl.trim()) newErrors.imageUrl = "Image URL is required!";
    if (!formData.type) newErrors.type = "Type is required!";
    if (formData.type === "Others" && !formData.customType.trim())
      newErrors.customType = "Custom Type is required when Type is 'Others'!";
    if (!formData.season) newErrors.season = "Season is required!";
    if (!formData.unit) newErrors.unit = "Unit is required!";
    if (formData.calories === "" || formData.calories < 0)
      newErrors.calories = "Calories must be greater than or equal to 0!";
    if (formData.protein === "" || formData.protein < 0)
      newErrors.protein = "Protein must be greater than or equal to 0!";
    if (formData.carbs === "" || formData.carbs < 0)
      newErrors.carbs = "Carbs must be greater than or equal to 0!";
    if (formData.fat === "" || formData.fat < 0)
      newErrors.fat = "Fat must be greater than or equal to 0!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "type" && value !== "Others") {
      setFormData((prev) => ({ ...prev, customType: "" }));
      setErrors({ ...errors, type: "", customType: "" });
    } else {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCaloriesChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value > 1000) {
      value = 1000;
      e.target.value = value;
    }

    setFormData({ ...formData, calories: value });
    setErrors({ ...errors, calories: "" });
  };

  const handleProteinChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value > 100) {
      value = 100;
      e.target.value = value;
    }

    setFormData({ ...formData, protein: value });
    setErrors({ ...errors, protein: "" });
  };

  const handleCarbsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value > 100) {
      value = 100;
      e.target.value = value;
    }

    setFormData({ ...formData, carbs: value });
    setErrors({ ...errors, carbs: "" });
  };

  const handleFatChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value > 100) {
      value = 100;
      e.target.value = value;
    }

    setFormData({ ...formData, fat: value });
    setErrors({ ...errors, fat: "" });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, imageUrl });
    setErrors({ ...errors, imageUrl: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const finalData = {
      ...formData,
      type: formData.type === "Others" ? formData.customType : formData.type,
    };
    const response = await ingredientService.createIngredient(finalData);
    if (response.success) {
      alert("Ingredient added successfully!");
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        type: "",
        customType: "",
        season: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        nutritionalInfo: "",
        unit: "",
      });
      setErrors({});
      onIngredientAdded();
    } else {
      alert("Failed to add ingredient: " + response.message);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Add New Ingredient
        </h2>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
          >
            Save Ingredient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name of ingredient"
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleCaloriesChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter calories"
                  min="0"
                  max="1000"
                  className={`w-full border ${
                    errors.calories ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                />
                <span className="ml-2 text-sm text-gray-500">kcal</span>
              </div>
              {errors.calories && <p className="text-red-500 text-sm mt-1">{errors.calories}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full border ${
                  errors.type ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              {formData.type === "Others" && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customType"
                    value={formData.customType}
                    onChange={handleChange}
                    placeholder="Enter custom type"
                    className={`w-full border ${
                      errors.customType ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.customType && (
                    <p className="text-red-500 text-sm mt-1">{errors.customType}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protein *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleProteinChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter protein"
                  min="0"
                  max="100"
                  className={`w-full border ${
                    errors.protein ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                />
                <span className="ml-2 text-sm text-gray-500">g</span>
              </div>
              {errors.protein && <p className="text-red-500 text-sm mt-1">{errors.protein}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carbs *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleCarbsChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter carbs"
                  min="0"
                  max="100"
                  className={`w-full border ${
                    errors.carbs ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                />
                <span className="ml-2 text-sm text-gray-500">g</span>
              </div>
              {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fat *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleFatChange}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter fat"
                  min="0"
                  max="100"
                  className={`w-full border ${
                    errors.fat ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                />
                <span className="ml-2 text-sm text-gray-500">g</span>
              </div>
              {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className={`w-full border ${
                  errors.season ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              >
                <option value="">Select Season</option>
                {["All Season", "Spring", "Summer", "Fall", "Winter"].map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              {errors.season && <p className="text-red-500 text-sm mt-1">{errors.season}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={`w-full border ${
                errors.unit ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            >
              <option value="">Select unit of measurement</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
            </select>
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-center items-center mb-2">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Ingredient preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center">
              <UploadComponent
                onUploadSuccess={handleImageUpload}
                reset={formData.imageUrl === ""}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Enter image URL"
                className={`w-full border ${
                  errors.imageUrl ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className={`w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIngredient;