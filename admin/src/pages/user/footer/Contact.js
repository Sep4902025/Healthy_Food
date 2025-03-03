import React, { useState } from "react";
import contactServices from "../../../services/footer/contactServices";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ success: null, message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await contactServices.createContact(formData);
    
    if (result.success) {
      setStatus({ success: true, message: "Gửi thành công!" });
      setFormData({ name: "", mail: "", subject: "", message: "" });
    } else {
      setStatus({ success: false, message: result.message });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Contact Us</h1>
      {status.message && (
        <p className={`mb-4 text-${status.success ? "green" : "red"}-500`}>
          {status.message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium">Họ tên:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Email:</label>
          <input 
            type="email" 
            name="mail" 
            value={formData.mail} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Chủ đề:</label>
          <input 
            type="text" 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Tin nhắn:</label>
          <textarea 
            name="message" 
            value={formData.message} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
