import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadComponent from "../../../components/UploadComponent";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import {
  Clock,
  Ruler,
  Dumbbell,
  Wheat,
  Droplet,
  Pencil,
  Trash2,
  Image as LucideImage,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TYPE_OPTIONS = [
  "Meat & Seafood",
  "Vegetables & Roots",
  "Spices & Herbs",
  "Grains & Beans",
  "Eggs & Dairy",
  "Dried & Processed Ingredients",
  "Others",
];

const TableIngredient = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
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
    unit: "",
  });
  const [errors, setErrors] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, [currentPage, itemsPerPage, filterType, searchTerm]);

  const fetchIngredients = async () => {
    setIsLoading(true);
    const response = await ingredientService.getAllIngredients(
      currentPage,
      itemsPerPage,
      filterType,
      searchTerm
    );
    if (response.success) {
      setIngredients(response.data.items);
      setTotalItems(response.data.total);
      setTotalPages(response.data.totalPages);
    }
    setIsLoading(false);
  };

  const handleEditClick = (ingredient) => {
    setEditData({
      ...ingredient,
      id: ingredient._id,
      customType: TYPE_OPTIONS.includes(ingredient.type) ? "" : ingredient.type,
      type: TYPE_OPTIONS.includes(ingredient.type) ? ingredient.type : "Others",
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) newErrors.name = "Name is required";
    if (!editData.description.trim()) newErrors.description = "Description is required";
    if (!editData.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    if (!editData.type) newErrors.type = "Type is required";
    if (editData.type === "Others" && !editData.customType.trim()) {
      newErrors.customType = "Custom type is required when 'Others' is selected";
    }
    if (!editData.unit) newErrors.unit = "Unit is required";
    if (editData.calories === "" || isNaN(editData.calories))
      newErrors.calories = "Calories is required and must be a number";
    if (editData.protein === "" || isNaN(editData.protein))
      newErrors.protein = "Protein is required and must be a number";
    if (editData.carbs === "" || isNaN(editData.carbs))
      newErrors.carbs = "Carbs is required and must be a number";
    if (editData.fat === "" || isNaN(editData.fat))
      newErrors.fat = "Fat is required and must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (["calories", "protein", "carbs", "fat"].includes(name)) {
      updatedValue = value.replace(/[^0-9]/g, "");
      updatedValue = updatedValue === "" ? "" : parseInt(updatedValue, 10);
      if (name === "calories") {
        updatedValue = isNaN(updatedValue) ? "" : Math.min(Math.max(0, updatedValue), 1000);
      } else {
        updatedValue = isNaN(updatedValue) ? "" : Math.min(Math.max(0, updatedValue), 100);
      }
    }

    setEditData((prev) => {
      const updatedData = { ...prev, [name]: updatedValue };
      if (name === "type" && updatedValue !== "Others") {
        updatedData.customType = "";
      }
      return updatedData;
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageUpload = (imageUrl) => {
    setEditData({ ...editData, imageUrl });
    setErrors({ ...errors, imageUrl: "" });
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const finalData = {
      ...editData,
      type: editData.type === "Others" ? editData.customType : editData.type,
    };
    const response = await ingredientService.updateIngredient(editData.id, finalData);
    if (response.success) {
      alert(`Ingredient "${editData.name}" has been saved!`);
      setIsEditModalOpen(false);
      fetchIngredients();
    } else {
      alert("Failed to save ingredient. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      const response = await ingredientService.hardDeleteIngredient(id);
      if (response.success) {
        alert("Deleted successfully!");
        fetchIngredients();
        if (ingredients.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete ingredient. Please try again.");
      }
    }
  };

  const handleToggleVisibility = async (ingredient) => {
    const updatedIngredient = { ...ingredient, isVisible: !ingredient.isVisible };
    try {
      await ingredientService.updateIngredient(ingredient._id, {
        isVisible: !ingredient.isVisible,
      });
      setIngredients((prevIngredients) =>
        prevIngredients.map((ing) => (ing._id === ingredient._id ? updatedIngredient : ing))
      );
    } catch (error) {
      alert("Failed to update visibility. Please try again.");
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({
      id: "",
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
      unit: "",
    });
    setErrors({});
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">List of Ingredients</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex space-x-1">
            {TYPE_OPTIONS.slice(0, 4).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(filterType === type ? "all" : type);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 text-sm font-medium rounded-full whitespace-nowrap transition duration-200 ${
                  filterType === type
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex space-x-1">
            {TYPE_OPTIONS.slice(4).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(filterType === type ? "all" : type);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 text-sm font-medium rounded-full whitespace-nowrap transition duration-200 ${
                  filterType === type
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => {
                setFilterType("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                filterType === "all"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by ingredient name"
            className="w-80 border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <div
                  key={ingredient._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  <img
                    src={ingredient.imageUrl || "https://via.placeholder.com/300"}
                    alt={ingredient.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-center">{ingredient.name}</h3>
                    <div className="flex justify-center items-center text-sm text-gray-600 mt-2">
                      <span className="mr-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Calories {ingredient.calories || "N/A"}
                      </span>
                      <span className="flex items-center">
                        <Ruler className="w-4 h-4 mr-1" />
                        Unit {ingredient.unit || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-center items-center text-sm text-gray-600 mt-1">
                      <span className="mr-3 flex items-center">
                        <Dumbbell className="w-4 h-4 mr-1" />
                        Protein {ingredient.protein || "N/A"}
                      </span>
                      <span className="mr-3 flex items-center">
                        <Wheat className="w-4 h-4 mr-1" />
                        Carbs {ingredient.carbs || "N/A"}
                      </span>
                      <span className="flex items-center">
                        <Droplet className="w-4 h-4 mr-1" />
                        Fat {ingredient.fat || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center p-2 bg-gray-100 border-t border-gray-200">
                    <button
                      onClick={() => handleEditClick(ingredient)}
                      className="text-blue-500 flex items-center px-2 py-1 hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <div className="h-4 border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleDelete(ingredient._id)}
                      className="text-red-500 flex items-center px-2 py-1 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleVisibility(ingredient)}
                    className={`absolute top-2 right-2 px-2 py-1 text-sm text-white rounded transition duration-200 ${
                      ingredient.isVisible
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {ingredient.isVisible ? "Hide" : "Show"}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500">
                <Wheat className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-lg font-semibold">No ingredients</p>
                <p className="text-sm">Looks like you haven't added any ingredients yet.</p>
                <button
                  onClick={() => navigate("/nutritionist/ingredients/add")}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  + Add Ingredient
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {totalItems > 0 && !isLoading && (
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              className="border rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="4">4 ingredients</option>
              <option value="8">8 ingredients</option>
              <option value="12">12 ingredients</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"
                }`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="border rounded px-3 py-1 hover:bg-gray-100"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-6 py-4 px-6">
              <label className="text-xl font-bold text-green-700">Edit Ingredient</label>
              <div className="ml-auto flex space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button className="text-gray-500 hover:text-gray-700" onClick={closeEditModal}>
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter ingredient name"
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="calories"
                        value={editData.calories || ""}
                        onChange={handleChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="0"
                        min="0"
                        max="1000"
                        className={`w-24 border ${
                          errors.calories ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                      <span className="ml-2 text-sm text-gray-500">kcal</span>
                    </div>
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={editData.type || ""}
                      onChange={handleChange}
                      className={`w-full border ${
                        errors.type ? "border-red-500" : "border-gray-300"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    >
                      <option value="">Select type</option>
                      {TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    {editData.type === "Others" && (
                      <>
                        <input
                          type="text"
                          name="customType"
                          value={editData.customType || ""}
                          onChange={handleChange}
                          placeholder="Enter custom type"
                          className={`w-full mt-2 border ${
                            errors.customType ? "border-red-500" : "border-gray-300"
                          } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                        {errors.customType && (
                          <p className="text-red-500 text-sm mt-1">{errors.customType}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="protein"
                        value={editData.protein || ""}
                        onChange={handleChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="0"
                        min="0"
                        max="100"
                        className={`w-24 border ${
                          errors.protein ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
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
                        type="number"
                        name="carbs"
                        value={editData.carbs || ""}
                        onChange={handleChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="0"
                        min="0"
                        max="100"
                        className={`w-24 border ${
                          errors.carbs ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fat *</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="fat"
                        value={editData.fat || ""}
                        onChange={handleChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="0"
                        min="0"
                        max="100"
                        className={`w-24 border ${
                          errors.fat ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    name="unit"
                    value={editData.unit || ""}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.unit ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="">Select unit</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </select>
                  {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                </div>

                <div className="bg-gray-100 p-6 rounded-lg">
                  <div className="flex justify-center items-center mb-2">
                    {editData.imageUrl ? (
                      <img
                        src={editData.imageUrl}
                        alt="Ingredient preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <LucideImage className="w-8 h-8 text-gray-400" />
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
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    {errors.imageUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <div className="flex border-b border-gray-200 justify-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                      Description *
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <textarea
                    name="description"
                    value={editData.description || ""}
                    onChange={handleChange}
                    placeholder="Enter description"
                    className={`w-full border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-green-500`}
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

export default TableIngredient;