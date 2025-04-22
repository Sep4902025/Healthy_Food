import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";
import UploadComponent from "../../../components/UploadComponent";
import uploadFile from "../../../helpers/uploadFile";
import imageCompression from "browser-image-compression";
import { PlusIcon, EditIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import Pagination from "../../../components/Pagination";
import { toast } from "react-toastify";

const TermOfUseManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formErrors, setFormErrors] = useState({ banner: "", content: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [termsPerPage, setTermsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [isSaving, setIsSaving] = useState(false); // Thêm state isSaving

  useEffect(() => {
    fetchTerms();
  }, [currentPage, termsPerPage]);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const result = await termService.getTerms(currentPage + 1, termsPerPage);
      if (result.success) {
        setTerms(result.data.data.terms || []);
        setTotalItems(result.data.total || 0);
      } else {
        setError(result.message);
        toast.error(result.message || "Failed to fetch Terms");
        setTerms([]);
      }
    } catch (err) {
      setError("Lỗi không xác định khi tải Terms");
      toast.error("Failed to fetch Terms");
      setTerms([]);
      console.error("❌ Lỗi trong fetchTerms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (term) => {
    const updatedTerm = { ...term, isVisible: !term.isVisible, isDeleted: term.isDeleted || false };
    const response = await termService.updateTerm(term._id, updatedTerm);
    if (response.success) {
      toast.success(`Term ${updatedTerm.isVisible ? "shown" : "hidden"} successfully!`);
      fetchTerms();
    } else {
      toast.error("Failed to update Term visibility");
      console.error("Error updating display status:", response.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      const response = await termService.hardDeleteTerm(id);
      if (response.success) {
        toast.success("Term deleted successfully!");
        fetchTerms();
      } else {
        toast.error("Failed to delete Term");
        console.error("Error while deleting:", response.message);
      }
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditData(item);
      setFormData({ bannerUrl: item.bannerUrl, content: item.content });
      setImagePreview(item.bannerUrl);
      setImageFile(null);
    } else {
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
      setImageFile(null);
      setImagePreview("");
    }
    setFormErrors({ banner: "", content: "" });
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
      setFormErrors({ ...formErrors, banner: "" });
    } else {
      setImageFile(null);
      setImagePreview("");
      setFormErrors({ ...formErrors, banner: "" });
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, bannerUrl: url });
    setImageFile(null);
    setImagePreview(url);
    setFormErrors({ ...formErrors, banner: "" });
  };

  const handleContentChange = (e)   => {
  setFormData({ ...formData, content: e.target.value });
    setFormErrors({ ...formErrors, content: "" });
  };

  const validateForm = () => {
    let errors = { banner: "", content: "" };
    let isValid = true;

    if (!formData.bannerUrl.trim() && !imageFile) {
      errors.banner = "Banner cannot be empty!";
      isValid = false;
    }
    if (!formData.content.trim()) {
      errors.content = "Content cannot be empty!";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true); // Bật trạng thái loading

    let finalBannerUrl = formData.bannerUrl;
    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const uploadedImage = await uploadFile(compressedFile, (percent) =>
          console.log(`Upload progress: ${percent}%`)
        );
        finalBannerUrl = uploadedImage.secure_url;
      } catch (error) {
        setIsSaving(false); // Tắt trạng thái loading nếu có lỗi
        toast.error("Image upload failed!");
        console.error("Upload error:", error);
        return;
      }
    }

    const dataToSave = { ...formData, bannerUrl: finalBannerUrl };
    const response = editData
      ? await termService.updateTerm(editData._id, dataToSave)
      : await termService.createTerm(dataToSave);

    setIsSaving(false); // Tắt trạng thái loading sau khi lưu xong
    if (response.success) {
      toast.success(editData ? "Term updated successfully!" : "Term created successfully!");
      setModalOpen(false);
      setEditData(null);
      setFormData({ bannerUrl: "", content: "" });
      setImageFile(null);
      setImagePreview("");
      fetchTerms();
    } else {
      toast.error(response.message || "Failed to save Term");
      console.error("Error:", response.message);
    }
  };

  const handlePageClick = ({ selected }) => {
    console.log("Selected Page:", selected);
    setCurrentPage(selected);
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
        <div className="loader border-t-4 border-[#40B491] rounded-full w-8 h-8 animate-spin"></div>
        <p className="mt-4 text-white text-lg">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );

  console.log("Current Page in Render:", currentPage);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          Terms of Use Management
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
          {terms.length > 0 ? (
            terms.map((item, index) => (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 items-center"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {currentPage * termsPerPage + index + 1}
                </div>
                <div className="col-span-2 flex justify-center">
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
                      item.isVisible
                        ? "bg-[#40B491] text-white"
                        : "bg-red-100 text-red-800"
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
            <div className="p-6 text-center text-gray-500">No terms.</div>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <Pagination
            key={currentPage}
            limit={termsPerPage}
            setLimit={(value) => {
              setTermsPerPage(value);
              setCurrentPage(0);
            }}
            totalItems={totalItems}
            handlePageClick={handlePageClick}
            text="Terms"
            currentPage={currentPage}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          {isSaving && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50">
              <div className="loader border-t-4 border-[#40B491] rounded-full w-8 h-8 animate-spin"></div>
              <p className="mt-4 text-white text-lg">Saving...</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#40B491]">
              {editData ? "Edit" : "Add New"} Term
            </h2>

            <label className="block mb-2 text-gray-700">Banner:</label>
            <UploadComponent
              onFileSelect={handleFileSelect}
              reset={!imageFile && !formData.bannerUrl}
              disabled={isSaving} // Vô hiệu hóa khi đang lưu
            />
            {!editData && (
              <input
                type="text"
                value={formData.bannerUrl}
                onChange={handleImageUrlChange}
                placeholder="Or enter banner URL"
                className="w-full border p-2 mt-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
                disabled={isSaving} // Vô hiệu hóa khi đang lưu
              />
            )}
            {formErrors.banner && (
              <p className="text-red-500 text-sm mt-1">{formErrors.banner}</p>
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
              className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-[#40B491]"
              rows="4"
              value={formData.content}
              onChange={handleContentChange}
              disabled={isSaving} // Vô hiệu hóa khi đang lưu
            ></textarea>
            {formErrors.content && (
              <p className="text-red-500 text-sm mb-2">{formErrors.content}</p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                onClick={() => setModalOpen(false)}
                disabled={isSaving} // Vô hiệu hóa khi đang lưu
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-[#40B491] text-white rounded hover:bg-[#359c7a] transition ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSave}
                disabled={isSaving} // Vô hiệu hóa khi đang lưu
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermOfUseManagement;