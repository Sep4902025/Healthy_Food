import React, { useState, useEffect } from "react";
import dishesService from "../../../services/nutritionist/dishesServices";
import UploadComponent from "../../../components/UploadComponent";
import uploadFile from "../../../helpers/uploadFile";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const FLAVOR_OPTIONS = ["Sweet", "Sour", "Salty", "Bitter", "Fatty"];
const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];
const SEASON_OPTIONS = ["All Season", "Spring", "Summer", "Fall", "Winter"];

const AddDishes = ({ onDishAdded = () => { } }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFile: null,
    imageUrl: "",
    videoUrl: "",
    cookingTime: "",
    nutritions: "",
    flavor: [],
    type: "",
    season: "",
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [isValidImageUrl, setIsValidImageUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.imageFile && !formData.imageUrl.trim())
      newErrors.imageUrl = "Image (file or URL) is required";
    else if (formData.imageUrl && !isValidImageUrl)
      newErrors.imageUrl = "Invalid image URL. Please provide a valid image link.";
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

  const handleCookingTimeChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);

    if (value < 0 || isNaN(value)) value = 0;
    else if (value > 1440) value = 1440;

    setFormData({ ...formData, cookingTime: value });
    setErrors({ ...errors, cookingTime: "" });
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
    } catch (error) {
      console.error("Image compression error:", error);
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
        const uploadedImage = await uploadFile(compressedFile, (percentComplete) => {
          console.log(`Upload progress: ${percentComplete}%`);
        });
        imageUrl = uploadedImage.secure_url;
      } catch (error) {
        setIsLoading(false);
        toast.success("Image upload failed!");
        console.error("Upload error:", error);
        return;
      }
    }

    const response = await dishesService.createDish({
      ...formData,
      imageUrl,
      flavor: formData.flavor.join(", "),
    });

    setIsLoading(false);

    if (response.success) {
      toast.success("Dish added successfully!");
      setFormData({
        name: "",
        description: "",
        imageFile: null,
        imageUrl: "",
        videoUrl: "",
        cookingTime: "",
        nutritions: "",
        flavor: [],
        type: "",
        season: "",
      });
      setErrors({});
      setImagePreview("");
      setIsValidImageUrl(false);
      onDishAdded();
      navigate("/nutritionist/dishes");
    } else {
      toast.success(response.message);
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
          Add New Dish
        </h2>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? "Saving..." : "Save Dish"}
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
              className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"
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
                placeholder="Cooking time"
                min="1"
                max="1440"
                className={`w-full border ${errors.cookingTime ? "border-red-500" : "border-gray-300"
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
                className={`w-full border ${errors.type ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              >
                <option value="">Select type</option>
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
              className={`w-full border ${errors.videoUrl ? "border-red-500" : "border-gray-300"
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
              className={`w-full border ${errors.season ? "border-red-500" : "border-gray-300"
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
            >
              <option value="">Select season</option>
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
            <div className="text-center mb-4">
              <UploadComponent
                onFileSelect={handleFileSelect}
                reset={formData.imageFile === null && !formData.imageUrl}
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
                className={`w-full border ${errors.imageUrl ? "border-red-500" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
            </div>
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-32 h-32 object-cover rounded border"
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
              className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"
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