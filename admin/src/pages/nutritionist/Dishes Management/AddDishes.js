import React, { useState } from "react";
import dishesService from "../../../services/nutritionist/dishesServices";
import UploadComponent from "../../../components/UploadComponent";

const AddDishes = ({ onDishAdded = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    cookingTime: "",
    nutritions: "",
    flavor: "",
    type: "",
    season: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cập nhật URL ảnh sau khi upload thành công
  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, imageUrl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await dishesService.createDish(formData);
    if (response.success) {
      alert("Dish added successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        cookingTime: "",
        nutritions: "",
        flavor: "",
        type: "",
        season: "",
      });

      onDishAdded(); // Cập nhật danh sách món ăn
    } else {
      alert(response.message);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-100">
      <h3 className="text-lg font-semibold">Add New Dish</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name of dish" className="border px-2 py-1 w-full mb-2" required />
        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="border px-2 py-1 w-full mb-2" />

        <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="Link video" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="cookingTime" value={formData.cookingTime} onChange={handleChange} placeholder="Cooking time" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="nutritions" value={formData.nutritions} onChange={handleChange} placeholder="Nutrition" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="Flavor" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Type of dish" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="season" value={formData.season} onChange={handleChange} placeholder="Suitable season" className="border px-2 py-1 w-full mb-2" />

        {/* Upload ảnh */}
        <label className="block mb-1">Upload Dish Image:</label>
        <UploadComponent onUploadSuccess={handleImageUpload} reset={formData.imageUrl === ""} />

        <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-4">Add New Dish</button>
      </form>
    </div>
  );
};

export default AddDishes;
