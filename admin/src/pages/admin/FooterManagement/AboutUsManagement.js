import React, { useEffect, useState } from "react";
import aboutService from "../../../services/footer/aboutServices";
import UploadComponent from "../../../components/UploadComponent";
import uploadFile from "../../../helpers/uploadFile";
import imageCompression from "browser-image-compression";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";

const AboutUsManagement = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAboutUs();
  }, [currentPage, itemsPerPage]);

  const fetchAboutUs = async () => {
    setLoading(true);
    try {
      const result = await aboutService.getAboutUs(currentPage + 1, itemsPerPage);
      console.log("🔍 API Response:", result);
      if (result.success && result.data) {
        const fetchedAboutUs = result.data.aboutUs || result.data.data?.aboutUs || [];
        setAboutData(fetchedAboutUs);
        setTotalItems(result.data.total || fetchedAboutUs.length);
      } else {
        setError(result.message || "No data returned from API");
        setAboutData([]);
      }
    } catch (err) {
      setError("Failed to fetch About Us data");
      console.error("❌ Fetch Error:", err);
      setAboutData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (about) => {
    const updatedAbout = { ...about, isVisible: !about.isVisible };
    const response = await aboutService.updateAboutUs(about._id, updatedAbout);
    if (response.success) {
      fetchAboutUs();
    } else {
      console.error("Error updating visibility:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const response = await aboutService.hardDeleteAboutUs(id);
      if (response.success) {
        fetchAboutUs();
      }
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditData(item);
      setFormData({ bannerUrl: item.bannerUrl, content: item.content });
      setImagePreview(item.bannerUrl);
      setImageFile(null); // Reset imageFile khi edit
    } else {
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
      setImageFile(null);
      setImagePreview("");
    }
    setModalOpen(true);
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression error:", error);
      return file;
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
      setFormData({ ...formData, bannerUrl: "" });
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, bannerUrl: url });
    setImageFile(null);
    setImagePreview(url);
  };

  const handleSave = async () => {
    if (!formData.bannerUrl.trim() && !imageFile) {
      alert("Banner cannot be empty!");
      return;
    }
    if (!formData.content.trim()) {
      alert("Content cannot be empty!");
      return;
    }

    let finalBannerUrl = formData.bannerUrl;
    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const uploadedImage = await uploadFile(compressedFile, (percent) =>
          console.log(`Upload progress: ${percent}%`)
        );
        finalBannerUrl = uploadedImage.secure_url;
      } catch (error) {
        alert("Image upload failed!");
        console.error("Upload error:", error);
        return;
      }
    }

    const dataToSave = { ...formData, bannerUrl: finalBannerUrl };
    const result = editData
      ? await aboutService.updateAboutUs(editData._id, dataToSave)
      : await aboutService.createAboutUs(dataToSave);

    if (result.success) {
      setModalOpen(false);
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
      setImageFile(null);
      setImagePreview("");
      fetchAboutUs();
    } else {
      alert(result.message);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-64">Error: {error}</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          About Us Management
        </h1>
        <button
          className="px-6 py-2 bg-[#40B491] text-white font-semibold rounded-full shadow-md hover:bg-[#359c7a] transition duration-300 flex items-center"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon size={16} className="mr-2" /> Add New
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
          <div className="col-span-1">No.</div>
          <div className="col-span-2">Banner</div>
          <div className="col-span-6">Content</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        <div className="divide-y divide-gray-200">
          {aboutData.length > 0 ? (
            aboutData.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {currentPage * itemsPerPage + index + 1}
                </div>
                <div className="col-span-2">
                  <img
                    src={item.bannerUrl}
                    alt="Banner"
                    className="w-14 h-14 object-cover rounded-full shadow-md"
                  />
                </div>
                <div className="col-span-6 text-gray-700 text-sm line-clamp-2">
                  {item.content}
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.isVisible ? "bg-[#40B491] text-white" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center space-x-3">
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                    onClick={() => handleOpenModal(item)}
                    title="Edit"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded text-white ${
                      item.isVisible
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#40B491] hover:bg-[#359c7a]"
                    } transition`}
                    onClick={() => handleToggleVisibility(item)}
                    title={item.isVisible ? "Hide" : "Show"}
                  >
                    {item.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={() => handleHardDelete(item._id)}
                    title="Delete"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No data found.</div>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <Pagination
            limit={itemsPerPage}
            setLimit={(value) => {
              setItemsPerPage(value);
              setCurrentPage(0);
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text="About Us"
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              {editData ? "Edit" : "Add New"} About Us
            </h2>

            <label className="block mb-2 text-gray-700">Banner:</label>
            <UploadComponent
              onFileSelect={handleFileSelect}
              reset={!imageFile && !formData.bannerUrl}
            />
            {!editData && (
              <input
                type="text"
                value={formData.bannerUrl}
                onChange={handleImageUrlChange}
                placeholder="Or enter banner URL"
                className="w-full border p-2 mt-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              />
            )}
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              </div>
            )}

            <label className="block mb-2 mt-4 text-gray-700">Content:</label>
            <textarea
              className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              rows="4"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUsManagement;