import React, { useState } from "react";
import medicalConditionService from "../../../services/nutritionist/medicalConditionServices";

const AddMedicalCondition = ({ onMedicalConditionAdded = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required!";
    if (!formData.description.trim()) newErrors.description = "Description is required!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill in all required fields correctly!");
      return;
    }

    const response = await medicalConditionService.createMedicalCondition(formData);
    if (response.success) {
      alert("Medical condition added successfully!");
      setFormData({
        name: "",
        description: "",
      });
      setErrors({});
      onMedicalConditionAdded();
    } else {
      alert("Failed to add medical condition: " + response.message);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <h2 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Add New Medical Condition
        </h2>
        <div className="ml-auto">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#40B491] text-white rounded-md hover:bg-[#359c7a] transition"
          >
            Save Medical Condition
          </button>
        </div>
      </div>

      {/* Single Panel */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name of medical condition"
            className={`w-full border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            className={`w-full border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md px-3 py-2 h-40 focus:outline-none focus:ring-2 focus:ring-[#40B491]`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMedicalCondition;