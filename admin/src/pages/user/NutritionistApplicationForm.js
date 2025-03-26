import React, { useState } from "react";
import UserService from "../../services/user.service";
import { toast } from "react-toastify";

const NutritionistApplicationForm = () => {
  const [formData, setFormData] = useState({
    personalInfo: { fullName: "", phoneNumber: "", address: "" },
    profileImage: "",
    introduction: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("personalInfo.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("Token gửi từ frontend:", token);
    const result = await UserService.submitNutritionistApplication(formData);
    if (result.success) {
      toast.success("Application submitted successfully!");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Apply to Become a Nutritionist
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="personalInfo.fullName"
            value={formData.personalInfo.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Phone Number</label>
          <input
            type="text"
            name="personalInfo.phoneNumber"
            value={formData.personalInfo.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            name="personalInfo.address"
            value={formData.personalInfo.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Profile Image URL</label>
          <input
            type="text"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Introduction</label>
          <textarea
            name="introduction"
            value={formData.introduction}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Application
        </button>
      </form>

      {/* Updated Preview Section */}
      <div className="mt-6 p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Preview Application</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Image and Personal Info */}
          <div className="w-full md:w-1/3 flex flex-col">
            <div className="mb-4">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/150")
                  }
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image Provided</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p>
                <strong>Full Name:</strong>{" "}
                {formData.personalInfo.fullName || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {formData.personalInfo.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {formData.personalInfo.address || "N/A"}
              </p>
            </div>
          </div>

          {/* Right Column: Introduction */}
          <div className="w-full md:w-2/3">
            <h3 className="text-lg font-semibold mb-2">Introduction</h3>
            <p className="text-gray-700 leading-relaxed">
              {formData.introduction || "No introduction provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionistApplicationForm;
