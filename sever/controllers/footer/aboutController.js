const AboutUs = require("../../models/footer/About");

// Lấy tất cả About Us
exports.getAllAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.find({ isDeleted: false });
        res.status(200).json({ status: "success", data: aboutUs });
    } catch (error) {
        res.status(500).json({ status: "fail", error: "Lỗi lấy dữ liệu About Us" });
    }
};

// Tạo mới About Us
exports.createAboutUs = async (req, res) => {
    try {
        console.log("Dữ liệu nhận từ client:", req.body);

        // Kiểm tra dữ liệu trước khi lưu vào DB
        const { banner_url, content } = req.body;
        if (!banner_url || !content) {
            return res.status(400).json({ status: "fail", error: "Thiếu dữ liệu đầu vào!" });
        }

        // Tạo mới trong MongoDB
        const newAboutUs = await AboutUs.create({ banner_url, content });

        res.status(201).json({ status: "success", data: newAboutUs });
    } catch (error) {
        console.error("Lỗi khi tạo About Us:", error);

        // Kiểm tra lỗi validation
        if (error.name === "ValidationError") {
            return res.status(400).json({ status: "fail", error: error.message });
        }

        res.status(500).json({ status: "fail", error: "Lỗi server khi tạo About Us" });
    }
};

// Cập nhật About Us
exports.updateAboutUs = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedAboutUs = await AboutUs.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ status: "success", data: updatedAboutUs });
    } catch (error) {
        res.status(500).json({ status: "fail", error: "Lỗi cập nhật About Us" });
    }
};

// Xóa mềm About Us
exports.softDeleteAboutUs = async (req, res) => {
    const { id } = req.params;
    try {
        await AboutUs.findByIdAndUpdate(id, { isDeleted: true });
        res.status(200).json({ status: "success", message: "About Us đã được xóa mềm" });
    } catch (error) {
        res.status(500).json({ status: "fail", error: "Lỗi xóa mềm About Us" });
    }
};

// Xóa cứng About Us
exports.hardDeleteAboutUs = async (req, res) => {
    const { id } = req.params;
    try {
        await AboutUs.findByIdAndDelete(id);
        res.status(200).json({ status: "success", message: "About Us đã bị xóa vĩnh viễn" });
    } catch (error) {
        res.status(500).json({ status: "fail", error: "Lỗi xóa cứng About Us" });
    }
};
