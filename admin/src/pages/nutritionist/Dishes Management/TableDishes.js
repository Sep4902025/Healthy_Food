import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UploadComponent from "../../../components/UploadComponent";
import dishesService from "../../../services/nutritionist/dishesServices";
import recipesService from "../../../services/nutritionist/recipesServices";
import {
  Clock,
  Utensils,
  Video,
  EditIcon,
  TrashIcon,
  Image,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";

const FLAVOR_OPTIONS = ["Sweet", "Sour", "Salty", "Bitter", "Fatty"];
const TYPE_OPTIONS = ["Heavy Meals", "Light Meals", "Beverages", "Desserts"];
const SEASON_OPTIONS = ["All Season", "Spring", "Summer", "Fall", "Winter"];

const TableDishes = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    videoUrl: "",
    cookingTime: "",
    flavor: [],
    type: "",
    season: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientCounts, setIngredientCounts] = useState({});
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, [currentPage, itemsPerPage, filterType, searchTerm]);

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const response = await dishesService.getAllDishes(currentPage, itemsPerPage, searchTerm);
      if (response.success) {
        const filteredByType =
          filterType === "all"
            ? response.data.items
            : response.data.items.filter((dish) => dish.type === filterType);
        setDishes(filteredByType);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setDishes([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      setDishes([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIngredientCounts = useCallback(async () => {
    if (dishes.length === 0) return;

    setLoadingIngredients(true);
    const counts = { ...ingredientCounts };
    const dishesToFetch = dishes.filter((dish) => counts[dish._id] === undefined);

    if (dishesToFetch.length > 0) {
      await Promise.all(
        dishesToFetch.map(async (dish) => {
          if (dish.recipeId) {
            try {
              const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
              if (recipeResponse.success && recipeResponse.data?.status === "success") {
                counts[dish._id] = recipeResponse.data.data.ingredients?.length || 0;
              } else {
                counts[dish._id] = 0;
              }
            } catch (error) {
              counts[dish._id] = 0;
            }
          } else {
            counts[dish._id] = 0;
          }
        })
      );
      setIngredientCounts(counts);
    }
    setLoadingIngredients(false);
  }, [dishes, ingredientCounts]);

  useEffect(() => {
    fetchIngredientCounts();
  }, [fetchIngredientCounts]);

  const handleEditClick = (dish) => {
    let flavorArray = [];
    if (Array.isArray(dish.flavor)) {
      if (dish.flavor.length > 0 && typeof dish.flavor[0] === "string" && dish.flavor[0].includes(",")) {
        flavorArray = dish.flavor[0].split(",").map((f) => f.trim());
      } else {
        flavorArray = dish.flavor;
      }
    } else if (typeof dish.flavor === "string" && dish.flavor) {
      flavorArray = dish.flavor.split(",").map((f) => f.trim());
    }

    const validFlavors = flavorArray.filter((flavor) => FLAVOR_OPTIONS.includes(flavor));
    setEditData({
      ...dish,
      id: dish._id,
      flavor: validFlavors,
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (!editData.description.trim()) newErrors.description = "Description is required";
    if (!editData.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    if (!editData.cookingTime) newErrors.cookingTime = "Cooking time is required";
    if (editData.flavor.length === 0) newErrors.flavor = "At least one flavor is required";
    if (!editData.type) newErrors.type = "Type is required";
    if (!editData.season) newErrors.season = "Season is required";
    if (editData.videoUrl) {
      const youtubeEmbedRegex = /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+\??(si=[A-Za-z0-9_-]+)?$/;
      if (!youtubeEmbedRegex.test(editData.videoUrl)) {
        newErrors.videoUrl = "Video URL must be a valid YouTube embed link";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const updatedData = {
      ...editData,
      flavor: editData.flavor.join(", "),
    };
    const response = await dishesService.updateDish(editData.id, updatedData);
    if (response.success) {
      alert(`Dish "${editData.name}" has been saved!`);
      setIsEditModalOpen(false);
      fetchDishes();
      setIngredientCounts({});
    } else {
      alert("Failed to save dish. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      const response = await dishesService.hardDeleteDish(id);
      if (response.success) {
        alert("Deleted successfully!");
        fetchDishes();
        if (dishes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete dish. Please try again.");
      }
    }
  };

  const handleToggleVisibility = async (dish) => {
    const updatedDish = { ...dish, isVisible: !dish.isVisible };
    try {
      await dishesService.updateDish(dish._id, { isVisible: !dish.isVisible });
      setDishes((prevDishes) =>
        prevDishes.map((d) => (d._id === dish._id ? updatedDish : d))
      );
    } catch (error) {
      alert("Failed to update visibility. Please try again.");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFlavorChange = (e) => {
    const value = e.target.value;
    setEditData((prev) => {
      const flavorArray = Array.isArray(prev.flavor) ? prev.flavor : [];
      if (flavorArray.includes(value)) {
        return { ...prev, flavor: flavorArray.filter((fl) => fl !== value) };
      } else {
        return { ...prev, flavor: [...flavorArray, value] };
      }
    });
    setErrors({ ...errors, flavor: "" });
  };

  const handleImageUpload = (imageUrl) => {
    setEditData({ ...editData, imageUrl });
    setErrors({ ...errors, imageUrl: "" });
  };

  const handleCookingTimeChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    value = value === "" ? "" : parseInt(value, 10);
    if (value < 0 || isNaN(value)) value = 0;
    else if (value > 1440) value = 1440;
    setEditData({ ...editData, cookingTime: value });
    setErrors({ ...errors, cookingTime: "" });
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    if (selectedPage >= 1 && selectedPage <= totalPages) {
      setCurrentPage(selectedPage);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({
      id: "",
      name: "",
      description: "",
      videoUrl: "",
      cookingTime: "",
      flavor: [],
      type: "",
      season: "",
      imageUrl: "",
    });
    setErrors({});
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Dishes
        </h2>
        <button
          onClick={() => navigate("/nutritionist/dishes/add")}
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
        >
          + Add Dish
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilterType("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold ${
              filterType === "all"
                ? "bg-[#40B491] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition duration-200`}
          >
            All
          </button>
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(filterType === type ? "all" : type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap ${
                filterType === type
                  ? "bg-[#40B491] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition duration-200`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by dish name"
            className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Dishes Grid */}
      <Loading isLoading={isLoading || loadingIngredients}>
        <div className="min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.length > 0 ? (
              dishes.map((dish) => (
                <div
                  key={dish._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden relative transition duration-200 hover:shadow-lg"
                >
                  <img
                    src={dish.imageUrl || "https://via.placeholder.com/300"}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center text-gray-800">
                      {dish.name}
                    </h3>
                    <div className="flex justify-center items-center text-sm text-gray-600 mt-2">
                      <span className="mr-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {dish.cookingTime || "N/A"} mins
                      </span>
                      <span className="flex items-center">
                        <Utensils className="w-4 h-4 mr-1" />
                        {ingredientCounts[dish._id] || 0} ingredients
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => window.open(dish.videoUrl, "_blank")}
                      className="text-[#40B491] flex items-center px-2 py-1 hover:text-[#359c7a] transition"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Watch Video
                    </button>
                    <div className="h-4 border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleEditClick(dish)}
                      className="text-[#40B491] flex items-center px-2 py-1 hover:text-[#359c7a] transition"
                    >
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <div className="h-4 border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleDelete(dish._id)}
                      className="text-red-500 flex items-center px-2 py-1 hover:text-red-600 transition"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleVisibility(dish)}
                    className={`absolute top-2 right-2 p-2 rounded-md text-white ${
                      dish.isVisible
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#40B491] hover:bg-[#359c7a]"
                    } transition duration-200`}
                  >
                    {dish.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
                <Utensils className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-lg font-semibold">No dishes</p>
                <p className="text-sm">Looks like you haven't added any dishes yet.</p>
                <button
                  onClick={() => navigate("/nutritionist/dishes/add")}
                  className="mt-4 px-6 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition duration-200"
                >
                  + Add Dish
                </button>
              </div>
            )}
          </div>
        </div>
      </Loading>

      {/* Pagination */}
      {totalItems > 0 && !isLoading && !loadingIngredients && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text={"Dishes"}
          />
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">Edit Dish</h2>
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
                >
                  Save
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter dish name"
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cooking Time *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="cookingTime"
                        value={editData.cookingTime || ""}
                        onChange={handleCookingTimeChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="1"
                        min="1"
                        max="1440"
                        className={`w-full border ${
                          errors.cookingTime ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      <span className="ml-2 text-sm text-gray-500">Minutes</span>
                    </div>
                    {errors.cookingTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.cookingTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={editData.type || ""}
                      onChange={handleChange}
                      className={`w-full border ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={editData.videoUrl || ""}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/embed/video_id"
                    className={`w-full border ${
                      errors.videoUrl ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.videoUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season *
                  </label>
                  <select
                    name="season"
                    value={editData.season || ""}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.season ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flavor *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {FLAVOR_OPTIONS.map((flavor) => (
                      <label key={flavor} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          value={flavor}
                          checked={Array.isArray(editData.flavor) && editData.flavor.includes(flavor)}
                          onChange={handleFlavorChange}
                          className="mr-2 h-4 w-4 text-[#40B491] focus:ring-[#40B491] rounded"
                        />
                        <span className="text-sm text-gray-700">{flavor}</span>
                      </label>
                    ))}
                  </div>
                  {errors.flavor && <p className="text-red-500 text-sm mt-1">{errors.flavor}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-center items-center mb-4">
                    {editData.imageUrl ? (
                      <img
                        src={editData.imageUrl}
                        alt="Dish preview"
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <UploadComponent
                      onUploadSuccess={handleImageUpload}
                      reset={editData.imageUrl === ""}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      value={editData.imageUrl || ""}
                      onChange={(e) => handleImageUpload(e.target.value)}
                      placeholder="Enter image URL"
                      className={`w-full border ${
                        errors.imageUrl ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
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
                    className={`w-full border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 h-96 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDishes;