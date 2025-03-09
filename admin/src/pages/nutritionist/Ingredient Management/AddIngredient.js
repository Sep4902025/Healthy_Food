import React, { useState } from "react";
import ingredientService from "../../../services/nutritionist/ingredientsServices";

const AddIngredient = ({ onIngredientAdded = () => { } }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        type: "",
        season: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        nutritionalInfo: "",
        unit: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await ingredientService.createIngredient(formData);
        if (response.success) {
            alert("Nguyên liệu đã được thêm thành công!");
            setFormData({
                name: "",
                description: "",
                image: "",
                type: "",
                season: "",
                calories: "",
                protein: "",
                carbs: "",
                fat: "",
                nutritionalInfo: "",
                unit: ""
            });
            onIngredientAdded(); // Cập nhật danh sách nguyên liệu sau khi thêm
        } else {
            alert(response.message);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold">Thêm Nguyên Liệu</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên nguyên liệu" className="border px-2 py-1 w-full mb-2" required />
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Ảnh nguyên liệu" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Loại nguyên liệu" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="season" value={formData.season} onChange={handleChange} placeholder="Mùa phù hợp" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="Calo" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="Protein (g)" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="Carbs (g)" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="Chất béo (g)" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="nutritionalInfo" value={formData.nutritionalInfo} onChange={handleChange} placeholder="Thông tin dinh dưỡng" className="border px-2 py-1 w-full mb-2"/>
                <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Đơn vị đo lường" className="border px-2 py-1 w-full mb-2" />
                <button type="submit" className="bg-green-500 text-white px-4 py-2">Thêm nguyên liệu</button>
            </form>
        </div>
    );
};

export default AddIngredient;
