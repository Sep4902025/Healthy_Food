import React, { useState } from "react";
import recipesService from "../../../services/nutritionist/recipesServices";

const AddRecipes = ({ onRecipeAdded = () => {} }) => {
    const [formData, setFormData] = useState({
        dishId: "",
        name: "",
        description: "",
        ingredients: [],
        cookingTime: "",
        totalServing: "",
    });
    
    const [ingredientInput, setIngredientInput] = useState({ ingredientId: "", quantity: "", unit: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleIngredientChange = (e) => {
        setIngredientInput({ ...ingredientInput, [e.target.name]: e.target.value });
    };

    const addIngredient = () => {
        if (ingredientInput.ingredientId && ingredientInput.quantity && ingredientInput.unit) {
            setFormData({
                ...formData,
                ingredients: [...formData.ingredients, ingredientInput],
            });
            setIngredientInput({ ingredientId: "", quantity: "", unit: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await recipesService.createRecipe(formData);
        if (response.success) {
            alert("Công thức đã được thêm thành công!");
            setFormData({
                dishId: "",
                name: "",
                description: "",
                ingredients: [],
                cookingTime: "",
                totalServing: "",
            });
            onRecipeAdded();
        } else {
            alert(response.message);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold">Thêm Công Thức</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="dishId" value={formData.dishId} onChange={handleChange} placeholder="Mã món ăn" className="border px-2 py-1 w-full mb-2" required />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên công thức" className="border px-2 py-1 w-full mb-2" required />
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" className="border px-2 py-1 w-full mb-2" />
                
                <div className="mb-2">
                    <h4 className="font-semibold">Thành phần:</h4>
                    <input type="text" name="ingredientId" value={ingredientInput.ingredientId} onChange={handleIngredientChange} placeholder="Mã nguyên liệu" className="border px-2 py-1 w-full mb-2" />
                    <input type="number" name="quantity" value={ingredientInput.quantity} onChange={handleIngredientChange} placeholder="Số lượng" className="border px-2 py-1 w-full mb-2" />
                    <input type="text" name="unit" value={ingredientInput.unit} onChange={handleIngredientChange} placeholder="Đơn vị" className="border px-2 py-1 w-full mb-2" />
                    <button type="button" onClick={addIngredient} className="bg-blue-500 text-white px-4 py-2">Thêm nguyên liệu</button>
                </div>

                <ul className="mb-2">
                    {formData.ingredients.map((ing, index) => (
                        <li key={index} className="text-sm">{`${ing.ingredientId} - ${ing.quantity} ${ing.unit}`}</li>
                    ))}
                </ul>
                
                <input type="number" name="cookingTime" value={formData.cookingTime} onChange={handleChange} placeholder="Thời gian nấu (phút)" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="totalServing" value={formData.totalServing} onChange={handleChange} placeholder="Khẩu phần ăn" className="border px-2 py-1 w-full mb-2" />
                <button type="submit" className="bg-green-500 text-white px-4 py-2">Thêm công thức</button>
            </form>
        </div>
    );
};

export default AddRecipes;