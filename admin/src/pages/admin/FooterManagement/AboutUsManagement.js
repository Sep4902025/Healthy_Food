import React, { useEffect, useState } from "react";
import aboutService from "../../../services/footer/aboutServices";

const AboutUsManagement = () => {
    const [aboutData, setAboutData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({ banner_url: "", content: "" });

    useEffect(() => {
        fetchAboutUs();
    }, []);

    const fetchAboutUs = async () => {
        setLoading(true);
        const result = await aboutService.getAboutUs();
        if (result.success) {
            setAboutData(result.data);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleToggleVisibility = async (id, isCurrentlyDeleted) => {
        const newStatus = !isCurrentlyDeleted; // Đảo trạng thái
        await aboutService.updateAboutUs(id, { isDeleted: newStatus });
        fetchAboutUs(); // Cập nhật lại danh sách
    };

    const handleHardDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mục này?")) {
            await aboutService.hardDeleteAboutUs(id);
            fetchAboutUs();
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditData(item);
            setFormData({ banner_url: item.banner_url, content: item.content });
        } else {
            setEditData(null);
            setFormData({ banner_url: "", content: "" });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.banner_url.trim()) {
            alert("Banner không được để trống!");
            return;
        }
        if (!formData.content.trim()) {
            alert("Nội dung không được để trống!");
            return;
        }
    
        if (editData) {
            await aboutService.updateAboutUs(editData._id, formData);
        } else {
            const result = await aboutService.createAboutUs(formData);
            if (!result.success) {
                alert(result.message); // Hiển thị lỗi cụ thể từ backend
                return;
            }
        }
    
        setModalOpen(false);
        fetchAboutUs();
    };
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Quản lý About Us</h1>

            <button
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => handleOpenModal()}
            >
                + Thêm mới
            </button>

            {loading && <p className="text-center text-blue-500">Đang tải...</p>}
            {error && <p className="text-center text-red-500">Lỗi: {error}</p>}

            <div className="bg-white shadow-lg rounded-lg p-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">STT</th>
                            <th className="border border-gray-300 p-2">Hình ảnh</th>
                            <th className="border border-gray-300 p-2">Nội dung</th>
                            <th className="border border-gray-300 p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aboutData.length > 0 ? (
                            aboutData.map((item, index) => (
                                <tr key={index} className="text-center border border-gray-300">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">
                                        <img
                                            src={item.banner_url}
                                            alt="Banner"
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                    </td>
                                    <td className="p-2 text-left">{item.content}</td>
                                    <td className="p-2">
    <div className="flex justify-center space-x-2">
        <button
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleOpenModal(item)}
        >
            Sửa
        </button>
        <button
            className={`px-2 py-1 text-white rounded ${
                item.isDeleted ? "bg-gray-500 hover:bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            onClick={() => handleToggleVisibility(item._id, item.isDeleted)}
        >
            {item.isDeleted ? "Đã ẩn" : "Ẩn"}
        </button>
        <button
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleHardDelete(item._id)}
        >
            Xóa vĩnh viễn
        </button>
    </div>
</td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-gray-500 p-4">
                                    Không có dữ liệu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {modalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-2xl font-bold mb-4">{editData ? "Chỉnh sửa" : "Thêm mới"} About Us</h2>

                        <label className="block mb-2">Banner URL:</label>
                        <input
                            type="text"
                            className="w-full border p-2 mb-4"
                            value={formData.banner_url}
                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                            placeholder="Nhập URL ảnh hoặc để trống nếu không thay đổi"
                        />

                        <label className="block mb-2">Nội dung:</label>
                        <textarea
                            className="w-full border p-2 mb-4"
                            rows="4"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                onClick={() => setModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded"
                                onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutUsManagement;
