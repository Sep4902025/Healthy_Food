import React, { useState } from "react";
import ingredientService from "../../../services/nutritionist/ingredientsServices";
import UploadComponent from "../../../components/UploadComponent"; // Import component upload ảnh

const AddIngredient = ({ onIngredientAdded = () => {} }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
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

    // Cập nhật URL ảnh sau khi upload thành công
    const handleImageUpload = (imageUrl) => {
        setFormData({ ...formData, imageUrl });
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await ingredientService.createIngredient(formData);
        if (response.success) {
            alert("Ingredients added successfully!");
            setFormData({
                name: "",
                description: "",
                imageUrl: "",
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
            <h3 className="text-lg font-semibold">Add New Ingredients</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name of ingredient" className="border px-2 py-1 w-full mb-2" required />
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="border px-2 py-1 w-full mb-2" />

                {/* Upload ảnh */}
               

                <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Type of ingredient" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="season" value={formData.season} onChange={handleChange} placeholder="Suitable season" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="Calo" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="Protein" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="Carbs" className="border px-2 py-1 w-full mb-2" />
                <input type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="Fat" className="border px-2 py-1 w-full mb-2" />
                <input type="text" name="nutritionalInfo" value={formData.nutritionalInfo} onChange={handleChange} placeholder="Nutritional Information" className="border px-2 py-1 w-full mb-2" />

                {/* Dropdown chọn đơn vị đo lường */}
                <select 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleChange} 
                    className="border px-2 py-1 w-full mb-2" 
                    required
                >
                    <option value="">Select unit of measurement</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                </select>

                <button type="submit" className="bg-green-500 text-white px-4 py-2">
                    Add New Ingredient
                </button>
                <label className="block mb-1">Upload Ingredient Image:</label>
                <UploadComponent onUploadSuccess={handleImageUpload} reset={formData.imageUrl === ""} />
                </form>
        </div>
    );
};

export default AddIngredient;
