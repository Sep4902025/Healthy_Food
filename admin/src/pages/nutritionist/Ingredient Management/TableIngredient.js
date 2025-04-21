import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UploadComponent from "../../../components/UploadComponent";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import {
  Ruler,
  Dumbbell,
  Wheat,
  Droplet,
  EditIcon,
  TrashIcon,
  Image as LucideImage,
  EyeOffIcon,
  EyeIcon,
  Flame,
} from "lucide-react";
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify";
import uploadFile from "../../../helpers/uploadFile";
import imageCompression from "browser-image-compression";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const TYPE_OPTIONS = [
  "Meat & Seafood",
  "Vegetables & Roots",
  "Spices & Herbs",
  "Grains & Beans",
  "Eggs & Dairy",
  "Dried & Processed Ingredients",
  "Others",
];

const SearchInput = memo(({ value, onChange, inputRef }) => {
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search by ingredient name"
      className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
      value={value}
      onChange={onChange}
      data-testid="search-input"
    />
  );
});

const IngredientList = memo(
  ({ ingredients, onEdit, onDelete, onToggleVisibility, isLoading }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
      {isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
          <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#40B491]"></div>
          <p className="text-lg font-semibold mt-4">Loading ingredients...</p>
        </div>
      ) : ingredients.length > 0 ? (
        ingredients.map((ingredient) => (
          <div
            key={ingredient._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
          >
            <img
              src={ingredient.imageUrl || "https://via.placeholder.com/300"}
              alt={ingredient.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-center text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {ingredient.name}
              </h3>
              <div className="text-sm text-gray-600 mt-2">
                <div className="flex justify-between">
                  <div className="flex flex-col space-y-2">
                    <span className="flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      Unit {ingredient.unit || "N/A"}
                    </span>
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="flex items-center">
                        Calories: {ingredient.calories || "0"} kcal
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Dumbbell className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="flex items-center">
                        Protein: {ingredient.protein || "0"} g
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Wheat className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="flex items-center">
                        Carbs: {ingredient.carbs || "0"} g
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Droplet className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="flex items-center">
                        Fat: {ingredient.fat || "0"} g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 bg-gray-50 border-t border-gray-200 h-16 flex items-center justify-center">
              <div className="flex w-full justify-center items-center gap-2">
                <button
                  onClick={() => onEdit(ingredient)}
                  className="flex-1 text-[#40B491] flex items-center justify-center px-2 py-1 hover:text-[#359c7a] transition whitespace-nowrap"
                  disabled={isLoading}
                >
                  <EditIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <div className="h-4 border-l border-gray-300 mx-1"></div>
                <button
                  onClick={() => onDelete(ingredient._id)}
                  className="flex-1 text-red-500 flex items-center justify-center px-2 py-1 hover:text-red-600 transition whitespace-nowrap"
                  disabled={isLoading}
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => onToggleVisibility(ingredient)}
              className={`absolute top-2 right-2 p-2 rounded-md text-white ${
                ingredient.isVisible
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-[#40B491] hover:bg-[#359c7a]"
              } transition duration-200`}
              disabled={isLoading}
            >
              {ingredient.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
          <Wheat className="w-24 h-24 text-gray-400 mb-4" />
          <p className="text-lg font-semibold">No ingredients</p>
          <p className="text-sm">Looks like you haven't added any ingredients yet.</p>
        </div>
      )}
    </div>
  )
);

// New Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, ingredientName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the ingredient <strong>{ingredientName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TableIngredient = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    type: "",
    season: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    unit: "",
  });
  const [errors, setErrors] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIngredientId, setDeleteIngredientId] = useState(null);
  const [deleteIngredientName, setDeleteIngredientName] = useState("");
  const searchInputRef = useRef(null);

  const fetchIngredients = useCallback(async (isInitialOrFilterChange = false) => {
    try {
      if (isInitialOrFilterChange) {
        setIsLoading(true);
      }
      const response = await ingredientService.getAllIngredients(
        currentPage + 1,
        itemsPerPage,
        filterType,
        searchTerm
      );
      if (response.success) {
        setIngredients(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setIngredients([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch {
      setIngredients([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      if (isInitialOrFilterChange) {
        setIsLoading(false);
      }
    }
  }, [currentPage, itemsPerPage, filterType, searchTerm]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(0);
      fetchIngredients();
    }, 500),
    [fetchIngredients]
  );

  useEffect(() => {
    fetchIngredients(true);
  }, [fetchIngredients, filterType, currentPage]);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleEditClick = (ingredient) => {
    setEditData({
      ...ingredient,
      id: ingredient._id,
      imageFile: null,
      type: ingredient.type,
      calories: ingredient.calories !== undefined ? String(ingredient.calories) : "",
      protein: ingredient.protein !== undefined ? String(ingredient.protein) : "",
      carbs: ingredient.carbs !== undefined ? String(ingredient.carbs) : "",
      fat: ingredient.fat !== undefined ? String(ingredient.fat) : "",
    });
    setImagePreview(ingredient.imageUrl || "");
    setErrors({});
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) newErrors.name = "Name is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():\-;]/i.test(editData.name)) {
      newErrors.name = "Input must not contain special characters.";
    } else if (editData.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters.";
    }

    if (!editData.description.trim()) newErrors.description = "Description is required";
    else if (/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?'"“”‘’():\-;]/i.test(editData.description)) {
      newErrors.description = "Input must not contain special characters.";
    } else if (editData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters.";
    }

    if (!editData.imageFile && !editData.imageUrl.trim() && !imagePreview) {
      newErrors.imageUrl = "Image (file or URL) is required";
    }
    if (!editData.type) newErrors.type = "Type is required";
    if (!editData.unit) newErrors.unit = "Unit is required";
    if (
      editData.calories === "" ||
      isNaN(parseFloat(editData.calories)) ||
      parseFloat(editData.calories) < 0
    )
      newErrors.calories = "Calories must be greater than or equal to 0";
    else if (parseFloat(editData.calories) > 1000)
      newErrors.calories = "Calories must not exceed 1000 kcal";
    if (
      editData.protein === "" ||
      isNaN(parseFloat(editData.protein)) ||
      parseFloat(editData.protein) < 0
    )
      newErrors.protein = "Protein must be greater than or equal to 0";
    else if (parseFloat(editData.protein) > 100)
      newErrors.protein = "Protein must not exceed 100 g";
    if (editData.carbs === "" || isNaN(parseFloat(editData.carbs)) || parseFloat(editData.carbs) < 0)
      newErrors.carbs = "Carbs must be greater than or equal to 0";
    else if (parseFloat(editData.carbs) > 100) newErrors.carbs = "Carbs must not exceed 100 g";
    if (editData.fat === "" || isNaN(parseFloat(editData.fat)) || parseFloat(editData.fat) < 0)
      newErrors.fat = "Fat must be greater than or equal to 0";
    else if (parseFloat(editData.fat) > 100) newErrors.fat = "Fat must not exceed 100 g";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (["calories", "protein", "carbs", "fat"].includes(name)) {
      if (value === "" || /^-?\d*\.?\d{0,2}$/.test(value)) {
        updatedValue = value;
      } else {
        return;
      }
    }

    setEditData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileSelect = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditData({ ...editData, imageFile: file, imageUrl: "" });
      setImagePreview(previewUrl);
      setErrors({ ...errors, imageUrl: "" });
    } else {
      setEditData({ ...editData, imageFile: null, imageUrl: "" });
      setImagePreview("");
      setErrors({ ...errors, imageUrl: "" });
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setEditData({ ...editData, imageUrl: url, imageFile: null });
    setErrors({ ...errors, imageUrl: "" });

    if (url) {
      checkImageUrl(url);
    } else {
      setImagePreview("");
    }
  };

  const checkImageUrl = (url) => {
    const img = new Image();
    img.onload = () => {
      setImagePreview(url);
    };
    img.onerror = () => {
      setImagePreview("");
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

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly!");
      return;
    }

    setIsEditLoading(true);

    let imageUrl = editData.imageUrl || imagePreview;
    if (editData.imageFile) {
      try {
        const compressedFile = await compressImage(editData.imageFile);
        const uploadedImage = await uploadFile(compressedFile, () => {});
        imageUrl = uploadedImage.secure_url;
      } catch {
        setIsEditLoading(false);
        toast.error("Image upload failed!");
        return;
      }
    }

    const finalData = {
      ...editData,
      imageUrl,
      type: editData.type,
      calories: parseFloat(editData.calories) || 0,
      protein: parseFloat(editData.protein) || 0,
      carbs: parseFloat(editData.carbs) || 0,
      fat: parseFloat(editData.fat) || 0,
    };
    const response = await ingredientService.updateIngredient(editData.id, finalData);
    setIsEditLoading(false);

    if (response.success) {
      toast.success(`Ingredient "${editData.name}" has been saved!`);
      setIsEditModalOpen(false);
      fetchIngredients(true);
    } else {
      toast.error("Failed to save ingredient. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const ingredient = ingredients.find((ing) => ing._id === id);
    if (ingredient) {
      setDeleteIngredientId(id);
      setDeleteIngredientName(ingredient.name);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    const response = await ingredientService.deleteIngredient(deleteIngredientId);
    setIsLoading(false);
    if (response.success) {
      toast.success("Deleted successfully!");
      fetchIngredients(true);
      if (ingredients.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      toast.error("Failed to delete ingredient. Please try again.");
    }
    setIsDeleteModalOpen(false);
    setDeleteIngredientId(null);
    setDeleteIngredientName("");
  };

  const handleToggleVisibility = async (ingredient) => {
    const newVisibility = !ingredient.isVisible;
    const updatedIngredient = { ...ingredient, isVisible: newVisibility };
    try {
      const response = await ingredientService.updateIngredient(ingredient._id, {
        isVisible: newVisibility,
      });
      if (response.success) {
        setIngredients((prevIngredients) =>
          prevIngredients.map((ing) => (ing._id === ingredient._id ? updatedIngredient : ing))
        );
        toast.success(
          `Ingredient "${ingredient.name}" is now ${newVisibility ? "visible" : "hidden"}!`
        );
      } else {
        toast.error("Failed to update visibility. Please try again.");
      }
    } catch {
      toast.error("Failed to update visibility. Please try again.");
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleFilterChange = useCallback((type) => {
    setFilterType((prev) => (prev === type ? "all" : type));
    setCurrentPage(0);
  }, []);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({
      id: "",
      name: "",
      description: "",
      imageUrl: "",
      imageFile: null,
      type: "",
      season: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      unit: "",
    });
    setErrors({});
    setImagePreview("");
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto px-6 py-8">
      <style>
        {`
          .loader {
            border-top-color: #40B491;
            border-bottom-color: #40B491;
          }
          .ingredient-list-container {
            transition: opacity 0.2s ease-in-out;
          }
          .ingredient-list-container.loading {
            opacity: 0.7;
          }
          input[type="text"] {
            transition: none;
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Ingredients
        </h2>
        <button
          onClick={() => navigate("/nutritionist/ingredients/add")}
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
          disabled={isLoading}
        >
          + Add Ingredient
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 rounded-md font-semibold ${
              filterType === "all"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
            disabled={isLoading}
          >
            All
          </button>
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                filterType === type
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
              disabled={isLoading}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <SearchInput
            value={inputValue}
            onChange={handleInputChange}
            inputRef={searchInputRef}
          />
        </div>
      </div>

      <div
        className={`ingredient-list-container ${isLoading ? "loading" : ""}`}
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        <IngredientList
          ingredients={ingredients}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          isLoading={isLoading}
        />
      </div>

      {totalItems > 0 && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            currentPage={currentPage}
            text="Ingredients"
          />
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl relative">
            {isEditLoading && (
              <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
                <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#40B491]"></div>
                <p className="mt-4 text-white text-lg">Saving...</p>
              </div>
            )}

            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">Edit Ingredient</h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className={`px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition ${
                    isEditLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isEditLoading}
                >
                  {isEditLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  disabled={isEditLoading}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter ingredient name"
                    maxLength={100}
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                    disabled={isEditLoading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  <p className="text-gray-500 text-sm mt-1">{editData.name.length}/100 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={editData.type || ""}
                      onChange={handleChange}
                      className={`w-full border ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isEditLoading}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="calories"
                        value={editData.calories || ""}
                        onChange={handleChange}
                        placeholder="0"
                        className={`w-full border ${
                          errors.calories ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                        disabled={isEditLoading}
                      />
                      <span className="ml-2 text-sm text-gray-500">kcal</span>
                    </div>
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="protein"
                        value={editData.protein || ""}
                        onChange={handleChange}
                        placeholder="0"
                        className={`w-full border ${
                          errors.protein ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                        disabled={isEditLoading}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.protein && (
                      <p className="text-red-500 text-sm mt-1">{errors.protein}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbs *</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="carbs"
                        value={editData.carbs || ""}
                        onChange={handleChange}
                        placeholder="0"
                        className={`w-full border ${
                          errors.carbs ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                        disabled={isEditLoading}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fat *</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="fat"
                        value={editData.fat || ""}
                        onChange={handleChange}
                        placeholder="0"
                        className={`w-full border ${
                          errors.fat ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                        disabled={isEditLoading}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    name="unit"
                    value={editData.unit || ""}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.unit ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                    disabled={isEditLoading}
                  >
                    <option value="">Select unit</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </select>
                  <div className="h-[24px]">
                    {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-center items-center mb-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Ingredient"
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <LucideImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <UploadComponent
                      onFileSelect={handleFileSelect}
                      reset={editData.imageFile === null && !editData.imageUrl}
                      disabled={isEditLoading}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      value={editData.imageUrl || ""}
                      onChange={handleImageUrlChange}
                      placeholder="Enter image URL"
                      className={`w-full border ${
                        errors.imageUrl ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      disabled={isEditLoading}
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editData.description || ""}
                    onChange={handleChange}
                    placeholder="Enter description"
                    maxLength={500}
                    className={`w-full border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 h-96 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                    disabled={isEditLoading}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {editData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        ingredientName={deleteIngredientName}
      />
    </div>
  );
};

export default TableIngredient;