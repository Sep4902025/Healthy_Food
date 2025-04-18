import React, { useState, useEffect } from "react";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import UploadComponent from "../../../components/UploadComponent";
import uploadFile from "../../../helpers/uploadFile";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null,
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
  const [imagePreview, setImagePreview] = useState("");
  const [isValidImageUrl, setIsValidImageUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():\-;]/i.test(formData.name)) {
      newErrors.name = "Input must not contain special characters.";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters.";
    }

    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():\-;]/i.test(formData.description)) {
      newErrors.description = "Input must not contain special characters.";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters.";
    }

    if (!formData.imageFile && !formData.imageUrl.trim())
      newErrors.imageUrl = "Image (file or URL) is required";
    else if (formData.imageUrl && !isValidImageUrl)
      newErrors.imageUrl = "Invalid image URL. Please provide a valid image link.";
    if (!formData.type) newErrors.type = "Type is required";
    if (formData.type === "Others" && !formData.customType.trim())
      newErrors.customType = "Custom Type is required when Type is 'Others'";
    if (!formData.season) newErrors.season = "Season is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (formData.calories === "" || isNaN(formData.calories) || formData.calories < 0)
      newErrors.calories = "Calories must be greater than or equal to 0";
    else if (formData.calories > 1000)
      newErrors.calories = "Calories must not exceed 1000 kcal";
    if (formData.protein === "" || isNaN(formData.protein) || formData.protein < 0)
      newErrors.protein = "Protein must be greater than or equal to 0";
    else if (formData.protein > 100)
      newErrors.protein = "Protein must not exceed 100 g";
    if (formData.carbs === "" || isNaN(formData.carbs) || formData.carbs < 0)
      newErrors.carbs = "Carbs must be greater than or equal to 0";
    else if (formData.carbs > 100)
      newErrors.carbs = "Carbs must not exceed 100 g";
    if (formData.fat === "" || isNaN(formData.fat) || formData.fat < 0)
      newErrors.fat = "Fat must be greater than or equal to 0";
    else if (formData.fat > 100)
      newErrors.fat = "Fat must not exceed 100 g";

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

  const handleNumericChange = (e, field) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleFileSelect = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsValidImageUrl(true);
      setFormData({ ...formData, imageFile: file, imageUrl: "" });
    } else {
      setImagePreview("");
      setIsValidImageUrl(false);
      setFormData({ ...formData, imageFile: null });
    }
    setErrors({ ...errors, imageUrl: "" });
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url, imageFile: null });
    setErrors({ ...errors, imageUrl: "" });

    if (url) {
      checkImageUrl(url);
    } else {
      setImagePreview("");
      setIsValidImageUrl(false);
    }
  };

  const checkImageUrl = (url) => {
    const img = new Image();
    img.onload = () => {
      setImagePreview(url);
      setIsValidImageUrl(true);
    };
    img.onerror = () => {
      setImagePreview("");
      setIsValidImageUrl(false);
      setErrors({ ...errors, imageUrl: "Invalid image URL. Please provide a valid image link." });
    };
    img.src = url;
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch {
      return file;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    setIsLoading(true);

    let imageUrl = formData.imageUrl;
    if (formData.imageFile) {
      try {
        const compressedFile = await compressImage(formData.imageFile);
        const uploadedImage = await uploadFile(compressedFile, () => {});
        imageUrl = uploadedImage.secure_url;
      } catch {
        setIsLoading(false);
        toast.error("Image upload failed!");
        return;
      }
    }

    const finalData = {
      ...formData,
      imageUrl,
      type: formData.type === "Others" ? formData.customType : formData.type,
    };
    const response = await ingredientService.createIngredient(finalData);

    setIsLoading(false);

    if (response.success) {
      toast.success("Ingredient added successfully!");
      setFormData({
        name: "",
        description: "",
        imageFile: null,
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
      setImagePreview("");
      setIsValidImageUrl(false);
      onIngredientAdded();
      navigate("/nutritionist/ingredients");
    } else {
      toast.error(response.message);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto px-6 py-8 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="loader"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      )}

      <div className="flex items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Add New Ingredient
        </h2>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save Ingredient"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name of ingredient"
              maxLength={100}
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            <p className="text-gray-500 text-sm mt-1">{formData.name.length}/100 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full border ${
                  errors.type ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {errors.customType && (
                    <p className="text-red-500 text-sm mt-1">{errors.customType}</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={(e) => handleNumericChange(e, "calories")}
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                  placeholder="Enter calories"
                  min="0"
                  className={`w-full border ${
                    errors.calories ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-500">kcal</span>
              </div>
              {errors.calories && <p className="text-red-500 text-sm mt-1">{errors.calories}</p>}
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
                  onChange={(e) => handleNumericChange(e, "protein")}
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                  placeholder="Enter protein"
                  min="0"
                  className={`w-full border ${
                    errors.protein ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isLoading}
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
                  onChange={(e) => handleNumericChange(e, "carbs")}
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                  placeholder="Enter carbs"
                  min="0"
                  className={`w-full border ${
                    errors.carbs ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isLoading}
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
                  onChange={(e) => handleNumericChange(e, "fat")}
                  onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                  placeholder="Enter fat"
                  min="0"
                  className={`w-full border ${
                    errors.fat ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
            <div className="text-center mb-4">
              <UploadComponent
                onFileSelect={handleFileSelect}
                reset={formData.imageFile === null && !formData.imageUrl}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Enter image URL"
                className={`w-full border ${
                  errors.imageUrl ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                disabled={isLoading}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
            </div>
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Ingredient"
                  className="w-24 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              maxLength={500}
              className={`w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 characters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIngredient;