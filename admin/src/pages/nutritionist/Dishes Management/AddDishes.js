import React, { useState } from "react";
import dishesService from "../../../services/nutritionist/dishesServices";
import UploadComponent from "../../../components/UploadComponent";

const FLAVOR_OPTIONS = ["Sweet", "Sour", "Salty", "Bitter", "Fatty"];
const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];
const SEASON_OPTIONS = ["All Season", "Spring", "Summer", "Fall", "Winter"];

const AddDishes = ({ onDishAdded = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    cookingTime: "",
    nutritions: "",
    flavor: [],
    type: "",
    season: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    if (!formData.cookingTime) newErrors.cookingTime = "Cooking time is required";
    if (formData.flavor.length === 0) newErrors.flavor = "At least one flavor is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.season) newErrors.season = "Season is required";

    if (formData.videoUrl) {
      const youtubeEmbedRegex =
        /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+\??(si=[A-Za-z0-9_-]+)?$/;
      if (!youtubeEmbedRegex.test(formData.videoUrl)) {
        newErrors.videoUrl =
          "Video URL must be a valid YouTube embed link (e.g., https://www.youtube.com/embed/video_id)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFlavorChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      flavor: prev.flavor.includes(value)
        ? prev.flavor.filter((fl) => fl !== value)
        : [...prev.flavor, value],
    }));
    setErrors({ ...errors, flavor: "" });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, imageUrl });
    setErrors({ ...errors, imageUrl: "" });
  };

  const handleCookingTimeChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value < 0 || isNaN(value)) value = 0;
    else if (value > 1440) value = 1440;

    setFormData({ ...formData, cookingTime: value });
    setErrors({ ...errors, cookingTime: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const response = await dishesService.createDish({
      ...formData,
      flavor: formData.flavor.join(", "),
    });

    if (response.success) {
      alert("Dish added successfully!");
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        cookingTime: "",
        nutritions: "",
        flavor: [],
        type: "",
        season: "",
      });
      setErrors({});
      onDishAdded();
    } else {
      alert(response.message);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Add New Dish
        </h2>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
          >
            Save Dish
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
              placeholder="Enter dish name"
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooking Time (minutes) *
              </label>
              <input
                type="number"
                name="cookingTime"
                value={formData.cookingTime}
                onChange={handleCookingTimeChange}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                placeholder="Time for cooking"
                min="1"
                max="1440"
                className={`w-full border ${
                  errors.cookingTime ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              />
              {errors.cookingTime && (
                <p className="text-red-500 text-sm mt-1">{errors.cookingTime}</p>
              )}
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
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="text"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/embed/video_id"
              className={`w-full border ${
                errors.videoUrl ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            />
            {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>}
          </div>

          <div className="mb-4">
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
              {SEASON_OPTIONS.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            {errors.season && <p className="text-red-500 text-sm mt-1">{errors.season}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Flavor *</label>
            <div className="flex flex-wrap gap-4">
              {FLAVOR_OPTIONS.map((flavor) => (
                <label key={flavor} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={flavor}
                    checked={formData.flavor.includes(flavor)}
                    onChange={handleFlavorChange}
                    className="mr-2 h-4 w-4 text-[#40B491] focus:ring-[#40B491] border-gray-300 rounded"
                  />
                  {flavor}
                </label>
              ))}
            </div>
            {errors.flavor && <p className="text-red-500 text-sm mt-1">{errors.flavor}</p>}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-center items-center mb-2">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Dish preview"
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
                onChange={(e) => handleImageUpload(e.target.value)}
                placeholder="Enter image URL"
                className={`w-full border ${
                  errors.imageUrl ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
            </div>
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

export default AddDishes;