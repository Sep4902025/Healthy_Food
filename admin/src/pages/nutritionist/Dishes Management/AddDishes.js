import React, { useState } from "react";
import dishesService from "../../../services/nutritionist/dishesServices";

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
    season: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await dishesService.createDish(formData);
    if (response.success) {
      alert("Món ăn đã được thêm thành công!");
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        cookingTime: "",
        nutritions: "",
        flavor: "",
        type: "",
        season: ""
      });
      onDishAdded(); // Cập nhật danh sách món ăn sau khi thêm
    } else {
      alert(response.message);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-100">
      <h3 className="text-lg font-semibold">Thêm Món Ăn</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên món ăn" className="border px-2 py-1 w-full mb-2" required />
        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Ảnh món ăn" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="Link video" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="cookingTime" value={formData.cookingTime} onChange={handleChange} placeholder="Thời gian nấu" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="nutritions" value={formData.nutritions} onChange={handleChange} placeholder="Dinh dưỡng" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="Hương vị" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Loại món ăn" className="border px-2 py-1 w-full mb-2" />
        <input type="text" name="season" value={formData.season} onChange={handleChange} placeholder="Mùa phù hợp" className="border px-2 py-1 w-full mb-2" />
        <button type="submit" className="bg-green-500 text-white px-4 py-2">Thêm món</button>
      </form>
    </div>
  );
};

export default AddDishes;
