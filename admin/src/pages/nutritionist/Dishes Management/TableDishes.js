import React, { useEffect, useState } from "react";
import UploadComponent from "../../../components/UploadComponent"; // Import component upload ảnh
import dishesService from "../../../services/nutritionist/dishesServices";

const TableDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const response = await dishesService.getAllDishes();
    if (response.success) {
      setDishes(response.data);
    } else {
      console.error("Error fetching dishes:", response.message);
    }
  };

  const handleEditClick = (dish) => {
    setEditingDish(dish._id);
    setFormData(dish);
    setShowEditForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý upload ảnh mới
  const handleImageUpload = (newImageUrl) => {
    setFormData({ ...formData, imageUrl: newImageUrl });
  };

  const handleUpdate = async () => {
    const response = await dishesService.updateDish(editingDish, formData);
    if (response.success) {
      fetchDishes();
      setEditingDish(null);
      setShowEditForm(false);
    } else {
      console.error("Error updating dish:", response.message);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this dish?");
    if (!isConfirmed) return;
  
    const response = await dishesService.hardDeleteDish(id);
    if (response.success) {
      fetchDishes();
    } else {
      console.error("Error deleting dish:", response.message);
    }
  };
  
  const handleToggleVisibility = async (dish) => {
    const updatedDish = { ...dish, isVisible: !dish.isVisible };
    const response = await dishesService.updateDish(dish._id, updatedDish);
    if (response.success) {
      fetchDishes();
    } else {
      console.error("Error toggling visibility:", response.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingDish(null);
    setShowEditForm(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dishes List</h2>
      {showEditForm && (
        <div className="bg-white p-4 border border-gray-300 mb-4">
          <h3 className="text-lg font-semibold mb-2">Edit Dish</h3>
          {["name", "description", "videoUrl", "cookingTime", "nutritions", "flavor", "type", "season"].map((field) => (
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
          
          <label className="block mb-1">Upload Image:</label>
          <UploadComponent onUploadSuccess={handleImageUpload} />

          <button className="bg-green-500 text-white px-4 py-2 mr-2" onClick={handleUpdate}>Save</button>
          <button className="bg-gray-500 text-white px-4 py-2" onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {["Name", "Description", "Image", "Video", "Cooking Time", "Nutritions", "Flavor", "Type", "Season", "Actions"].map((header) => (
              <th key={header} className="border px-4 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish._id}>
              <td className="border px-4 py-2">{dish.name}</td>
              <td className="border px-4 py-2">{dish.description || "No description"}</td>
              <td className="border px-4 py-2">
                {dish.imageUrl ? <img src={dish.imageUrl} alt={dish.name} className="w-16 h-16 object-cover" /> : "N/A"}
              </td>
              <td className="border px-4 py-2">
                {dish.videoUrl ? <a href={dish.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">Watch Video</a> : "N/A"}
              </td>
              <td className="border px-4 py-2">{dish.cookingTime || "N/A"}</td>
              <td className="border px-4 py-2">{dish.nutritions?.join(", ") || "N/A"}</td>
              <td className="border px-4 py-2">{dish.flavor?.join(", ") || "N/A"}</td>
              <td className="border px-4 py-2">{dish.type}</td>
              <td className="border px-4 py-2">{dish.season || "N/A"}</td>
              <td className="border px-4 py-2 flex space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1" onClick={() => handleEditClick(dish)}>Edit</button>
                <button className="bg-red-500 text-white px-2 py-1" onClick={() => handleDelete(dish._id)}>Delete</button>
                <button className={`px-2 py-1 text-white ${dish.isVisible ? "bg-gray-500" : "bg-green-500"}`} onClick={() => handleToggleVisibility(dish)}>
                  {dish.isVisible ? "Hidden" : "Visible"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableDishes;
