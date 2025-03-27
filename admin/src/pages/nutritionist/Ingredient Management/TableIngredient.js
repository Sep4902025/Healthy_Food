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
  EditIcon,
  TrashIcon,
  Image as LucideImage,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import Pagination from "../../../components/Pagination";

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
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          List of Ingredients
        </h2>
        <button
          onClick={() => navigate("/nutritionist/ingredients/add")}
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300"
        >
          + Add Ingredient
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
            placeholder="Search by ingredient name"
            className="w-full max-w-md p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Ingredients Grid */}
      {isLoading ? (
        <div className="text-center py-4">
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ingredients.length > 0 ? (
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
                  <div className="flex justify-center items-center p-2 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleEditClick(ingredient)}
                      className="text-[#40B491] flex items-center px-2 py-1 hover:text-[#359c7a] transition"
                    >
                      <EditIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <div className="h-4 border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => handleDelete(ingredient._id)}
                      className="text-red-500 flex items-center px-2 py-1 hover:text-red-600 transition"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleVisibility(ingredient)}
                    className={`absolute top-2 right-2 p-2 rounded-md text-white ${
                      ingredient.isVisible
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#40B491] hover:bg-[#359c7a]"
                    } transition duration-200`}
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
                <button
                  onClick={() => navigate("/nutritionist/ingredients/add")}
                  className="mt-4 px-6 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition duration-200"
                >
                  + Add Ingredient
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && !isLoading && (
        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text={"Ingredients"}
          />
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-[#40B491]">Edit Ingredient</h2>
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
                    placeholder="Enter ingredient name"
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        className={`w-full border ${
                          errors.calories ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      <span className="ml-2 text-sm text-gray-500">kcal</span>
                    </div>
                    {errors.calories && (
                      <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
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
                          } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                        />
                        {errors.customType && (
                          <p className="text-red-500 text-sm mt-1">{errors.customType}</p>
                        )}
                      </>
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
                        type="number"
                        name="protein"
                        value={editData.protein || ""}
                        onChange={handleChange}
                        onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                        placeholder="0"
                        min="0"
                        max="100"
                        className={`w-full border ${
                          errors.protein ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.protein && (
                      <p className="text-red-500 text-sm mt-1">{errors.protein}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs *
                    </label>
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
                        className={`w-full border ${
                          errors.carbs ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.carbs && <p className="text-red-500 text-sm mt-1">{errors.carbs}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat *
                    </label>
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
                        className={`w-full border ${
                          errors.fat ? "border-red-500" : "border-gray-300"
                        } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                      />
                      <span className="ml-2 text-sm text-gray-500">g</span>
                    </div>
                    {errors.fat && <p className="text-red-500 text-sm mt-1">{errors.fat}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={editData.unit || ""}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.unit ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
                  >
                    <option value="">Select unit</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                  </select>
                  {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-center items-center mb-4">
                    {editData.imageUrl ? (
                      <img
                        src={editData.imageUrl}
                        alt="Ingredient preview"
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

export default TableIngredient;