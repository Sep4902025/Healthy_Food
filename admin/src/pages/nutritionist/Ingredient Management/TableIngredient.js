import React, { useEffect, useState } from "react";
import ingredientService from "../../../services/nutritionist/ingredientsServices";

const TableIngredient = () => {
  const [ingredients, setIngredients] = useState([]);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const response = await ingredientService.getAllIngredients();
    if (response.success) {
      setIngredients(response.data);
    } else {
      console.error("Error fetching ingredients:", response.message);
    }
  };

  const handleEditClick = (ingredient) => {
    setEditingIngredient(ingredient._id);
    setFormData(ingredient);
    setShowEditForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const response = await ingredientService.updateIngredient(editingIngredient, formData);
    if (response.success) {
      fetchIngredients();
      setEditingIngredient(null);
      setShowEditForm(false);
    } else {
      console.error("Error updating ingredient:", response.message);
    }
  };

  const handleDelete = async (id) => {
    const response = await ingredientService.hardDeleteIngredient(id);
    if (response.success) {
      fetchIngredients();
    } else {
      console.error("Error deleting ingredient:", response.message);
    }
  };

  const handleToggleVisibility = async (ingredient) => {
    const updateIngredient = { ...ingredient, isVisible: !ingredient.isVisible };
    const response = await ingredientService.updateIngredient(ingredient._id, updateIngredient);
    if (response.success) {
      fetchIngredients();
    } else {
      console.error("Error toggling visibility:", response.message);
    }
  };


  const handleCancelEdit = () => {
    setEditingIngredient(null);
    setShowEditForm(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ingredients List</h2>

      {showEditForm && (
        <div className="bg-white p-4 border border-gray-300 mb-4">
          <h3 className="text-lg font-semibold mb-2">Edit Ingredient</h3>
          {["name", "description", "imageUrl", "type", "season", "calories", "protein", "carbs", "fat", "unit", "nutritionalInfo"].map((field) => (
            <div key={field} className="mb-2">
              <label className="block mb-1 capitalize">{field.replace("_", " ")}</label>
              <input
                type="text"
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                className="border px-2 py-1 w-full"
              />
            </div>
          ))}
          <button className="bg-green-500 text-white px-4 py-2 mr-2" onClick={handleUpdate}>Save</button>
          <button className="bg-gray-500 text-white px-4 py-2" onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {["Name", "Description", "Image", "Type", "Season", "Calories", "Protein", "Carbs", "Fat", "Nutritional Info", "Unit", "Actions"].map((header) => (
              <th key={header} className="border px-4 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient._id}>
              <td className="border px-4 py-2">{ingredient.name}</td>
              <td className="border px-4 py-2">{ingredient.description || "No description"}</td>
              <td className="border px-4 py-2">
                {ingredient.imageUrl ? <img src={ingredient.imageUrl} alt={ingredient.name} className="w-16 h-16 object-cover" /> : "N/A"}
              </td>
              <td className="border px-4 py-2">{ingredient.type || "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.season || "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.calories ?? "N/A"} kcal</td>
              <td className="border px-4 py-2">{ingredient.protein ?? "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.carbs ?? "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.fat ?? "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.nutritionalInfo || "N/A"}</td>
              <td className="border px-4 py-2">{ingredient.unit || "N/A"}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1" onClick={() => handleEditClick(ingredient)}>Edit</button>
                <button className="bg-red-500 text-white px-2 py-1" onClick={() => handleDelete(ingredient._id)}>Delete</button>
                <button className={`px-2 py-1 text-white ${ingredient.isVisible ? "bg-gray-500" : "bg-green-500"}`} onClick={() => handleToggleVisibility(ingredient)}>
                  {ingredient.isVisible ? "Ẩn" : "Hiện"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableIngredient;
