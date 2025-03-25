const ContactUs = require("../../models/footer/Contact");

// Lấy tất cả Contact Us
exports.getAllContactUs = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query (mặc định page=1, limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Đếm tổng số bản ghi chưa bị xóa
        const total = await ContactUs.countDocuments({ isDeleted: false });

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit);

        // Lấy dữ liệu Contact Us với phân trang
        const contactUs = await ContactUs.find({ isDeleted: false })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: "success",
            data: {
                items: contactUs,
                total,
                currentPage: page,
                totalPages,
            },
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Lỗi lấy dữ liệu Contact Us" });
    }
};
exports.createContactUs = async (req, res) => {
    try {
        console.log("📩 Received data:", req.body);
        if (!req.body.name || !req.body.mail || !req.body.subject || !req.body.message) {
            return res.status(400).json({ status: "error", error: "Thiếu thông tin cần thiết" });
        }

        const newContactUs = await ContactUs.create(req.body);
        res.status(201).json({ status: "success", data: newContactUs });
    } catch (error) {
        console.error("❌ Error creating contact:", error);
        res.status(500).json({ status: "error", error: "Lỗi tạo Contact Us", details: error.message });
    }
};

// Xóa cứng Contact Us
exports.hardDeleteContactUs = async (req, res) => {
    const { id } = req.params;
    try {
        const contact = await ContactUs.findById(id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact không tồn tại!" });
        }
        await ContactUs.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Contact Us đã bị xóa vĩnh viễn" });
    } catch (error) {
        console.error("Lỗi xóa liên hệ:", error);
        res.status(500).json({ success: false, message: "Lỗi xóa cứng Contact Us" });
    }
};

// Cập nhật trạng thái isResolved của Contact Us
exports.updateContactUs = async (req, res) => {
    try {
        console.log(`📤 Cập nhật Contact ID: ${req.params.id}`, req.body);

        const updatedContact = await ContactUs.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ success: false, message: "Contact không tồn tại." });
        }

        console.log("✅ Contact đã được cập nhật:", updatedContact);
        res.json({ success: true, message: "Cập nhật thành công!", data: updatedContact });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật Contact:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật Contact", error: error.message });
    }
};


