    import React, { useEffect, useState } from "react";
    import aboutService from "../../../services/footer/aboutServices";
    import UploadComponent from "../../../components/UploadComponent";
    import {
        PlusIcon,
        EditIcon,
        TrashIcon,
        EyeOffIcon,
        EyeIcon,
    } from "lucide-react";

    const AboutUsManagement = () => {
        const [aboutData, setAboutData] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [modalOpen, setModalOpen] = useState(false);
        const [editData, setEditData] = useState(null);
        const [formData, setFormData] = useState({ bannerUrl: "", content: "" });
        const [currentPage, setCurrentPage] = useState(1);
        const [usersPerPage, setUsersPerPage] = useState(5);


        const paginate = (pageNumber) => setCurrentPage(pageNumber);

        // Xử lý phân trang
        const indexOfLastItem = currentPage * usersPerPage;
        const indexOfFirstItem = indexOfLastItem - usersPerPage;
        const currentData = aboutData.slice(indexOfFirstItem, indexOfLastItem);



        useEffect(() => {
            fetchAboutUs();
        }, []);

        const fetchAboutUs = async (callback) => {
            setLoading(true);
            const result = await aboutService.getAboutUs();
            if (result.success) {
                setAboutData(result.data);
                if (callback) callback(result.data);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };

        const handleToggleVisibility = async (about) => {
            const updatedAbout = { ...about, isVisible: !about.isVisible };
            const response = await aboutService.updateAboutUs(about._id, updatedAbout);

            if (response.success) {
                fetchAboutUs(); // Cập nhật lại danh sách trên trang quản lý
            } else {
                console.error("Error updating display status:", response.message);
            }
        };

        const handleHardDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this item?")) {
                await aboutService.hardDeleteAboutUs(id);
                fetchAboutUs(() => {
                    const totalPages = Math.ceil((aboutData.length - 1) / usersPerPage);
                    if (currentPage > totalPages) {
                        setCurrentPage(totalPages || 1);
                    }
                });
            }
        };

        const handleOpenModal = (item = null) => {
            if (item) {
                setEditData(item);
                setFormData({ bannerUrl: item.bannerUrl, content: item.content });
            } else {
                setEditData(null);
                setFormData({ bannerUrl: "", content: "" });
            }
            setModalOpen(true);
        };

        const handleSave = async () => {
            if (!formData.bannerUrl.trim()) {
                alert("Banner cannot be empty!");
                return;
            }
            if (!formData.content.trim()) {
                alert("Content cannot be empty!");
                return;
            }

            if (editData) {
                await aboutService.updateAboutUs(editData._id, formData);
            } else {
                const result = await aboutService.createAboutUs(formData);
                if (!result.success) {
                    alert(result.message);
                    return;
                }
            }

            setModalOpen(false);
            fetchAboutUs();
        };

        const handleImageUpload = (imageUrl) => {
            setFormData({ ...formData, bannerUrl: imageUrl });
        };

        if (loading) return <p className="text-center text-blue-500">Loading...</p>;
        if (error) return <p className="text-center text-red-500">Error: {error}</p>;

        return (
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold">About Us Management</h1>

                <button
                    className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={() => handleOpenModal()}
                >
                    + Add New
                </button>

                <div className="bg-white shadow-lg rounded-2xl p-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="p-3 text-left">No.</th>
                                <th className="p-3 text-left">Banner</th>
                                <th className="p-3 text-left">Content</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 text-gray-900">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">
                                            <img
                                                src={item.bannerUrl}
                                                alt="Banner"
                                                className="w-14 h-14 object-cover rounded-full shadow-md"
                                            />
                                        </td>
                                        <td className="p-3">{item.content}</td>
                                        <td className="p-3 text-center">
                                            <span
                                                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${item.isVisible
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.isVisible ? "Visible" : "Hidden"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {/* Nút chỉnh sửa */}
                                                <button
                                                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                    onClick={() => handleOpenModal(item)}
                                                >
                                                    <EditIcon size={16} />
                                                </button>

                                                {/* Nút Ẩn/Hiện */}
                                                <button
                                                    className={`p-2 rounded-full text-white ${item.isVisible
                                                        ? "bg-gray-500 hover:bg-gray-600"
                                                        : "bg-green-500 hover:bg-green-600"
                                                        }`}
                                                    onClick={() => handleToggleVisibility(item)}
                                                >
                                                    {item.isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                                </button>

                                                {/* Nút Xóa vĩnh viễn */}
                                                <button
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    onClick={() => handleHardDelete(item._id)}
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-gray-500 p-4">
                                        No data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
                className="border rounded px-2 py-1"
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
            >
                <option value="5">5 Users</option>
                <option value="10">10 Users</option>
                <option value="15">15 Users</option>
            </select>
        </div>
        <div className="flex space-x-2">
            <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &lt;
            </button>
            {Array.from(
                { length: Math.ceil(aboutData.length / usersPerPage) },
                (_, i) => (
                    <button
                        key={i}
                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-green-500 text-white" : "border hover:bg-gray-100"}`}
                        onClick={() => paginate(i + 1)}
                    >
                        {i + 1}
                    </button>
                )
            )}
            <button
                className="border rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(aboutData.length / usersPerPage)}
            >
                &gt;
            </button>
        </div>
    </div>

                </div>

                {/* Modal Form */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">{editData ? "Edit" : "Add new"} About Us</h2>

                            <label className="block mb-2">Banner URL:</label>

                            <UploadComponent onUploadSuccess={handleImageUpload} reset={formData.imageUrl === ""} />

                            <label className="block mb-2 mt-4">Content:</label>
                            <textarea
                                className="w-full border p-2 mb-4 rounded"
                                rows="4"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>

                            <div className="flex justify-end space-x-2">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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