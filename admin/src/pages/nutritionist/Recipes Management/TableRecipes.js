import React, { useEffect, useState } from "react";
import recipesService from "../../../services/nutritionist/recipesServices";

const TableRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await recipesService.getAllRecipes();
      if (response?.success) {
        setRecipes(response.data);
      } else {
        console.error("Error fetching recipes:", response?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleEditClick = (recipe) => {
    setEditingRecipe(recipe._id);
    setFormData(recipe);
    setShowEditForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const response = await recipesService.updateRecipe(editingRecipe, formData);
    if (response.success) {
      fetchRecipes();
      setEditingRecipe(null);
      setShowEditForm(false);
    } else {
      console.error("Error updating recipe:", response.message);
    }
  };

  const handleDelete = async (recipeId) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa công thức này không?");
    if (!isConfirmed) return;
  
    try {
      // Gọi API để chỉ xóa recipe (KHÔNG xóa dish)
      const response = await recipesService.deleteRecipe(recipeId);
      
      if (response.success) {
        alert("Recipe đã được xóa thành công!");
        fetchRecipes(); // Cập nhật lại danh sách recipe
      } else {
        console.error("Error deleting recipe:", response.message);
        alert("Xóa thất bại: " + response.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Có lỗi xảy ra khi xóa!");
    }
  };
  

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    setShowEditForm(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recipes List</h2>

      {showEditForm && (
        <div className="bg-white p-4 border border-gray-300 mb-4">
          <h3 className="text-lg font-semibold mb-2">Edit Recipe</h3>
          {Object.keys(formData).map((key) => (
            <div key={key} className="mb-2">
              <label className="block mb-1">{key}</label>
              <input
                type={typeof formData[key] === "number" ? "number" : "text"}
                name={key}
                value={formData[key] || ""}
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
            {[
              "Name", "Description", "Image", "Video", "Cooking Time",
              "Calories", "Protein", "Carbs", "Fat", "Serving",
              "Flavor", "Type", "Season", "Actions"
            ].map((header) => (
              <th key={header} className="border px-4 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe._id}>
              <td className="border px-4 py-2">{recipe.name}</td>
              <td className="border px-4 py-2">{recipe.description ?? "N/A"}</td>
              <td className="border px-4 py-2">
                {recipe.imageUrl ? <img src={recipe.imageUrl} alt="Recipe" className="w-16 h-16 object-cover" /> : "N/A"}
              </td>
              <td className="border px-4 py-2">
                {recipe.videoUrl ? <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">Watch Video</a> : "N/A"}
              </td>
              <td className="border px-4 py-2">{recipe.cookingTime ?? "N/A"} min</td>
              <td className="border px-4 py-2">{recipe.calories ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.protein ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.carbs ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.fat ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.totalServing ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.flavor ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.type ?? "N/A"}</td>
              <td className="border px-4 py-2">{recipe.season ?? "N/A"}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1" onClick={() => handleEditClick(recipe)}>Edit</button>
                <button className="bg-red-500 text-white px-2 py-1" onClick={() => handleDelete(recipe._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableRecipes;
