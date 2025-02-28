const Term = require("../../models/footer/Term");

// Lấy tất cả Terms
exports.getAllTerms = async (req, res) => {
    try {
        const terms = await Term.find({ isDeleted: false });
        res.status(200).json({ status: "success", data: terms });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi lấy dữ liệu Terms" });
    }
};

// Tạo mới Term
exports.createTerm = async (req, res) => {
    try {
        const newTerm = await Term.create(req.body);
        res.status(201).json({ status: "success", data: newTerm });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi tạo Terms" });
    }
};

// Cập nhật Term
exports.updateTerm = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedTerm = await Term.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ status: "success", data: updatedTerm });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi cập nhật Terms" });
    }
};

// Xóa mềm Term
exports.softDeleteTerm = async (req, res) => {
    const { id } = req.params;
    try {
        await Term.findByIdAndUpdate(id, { isDeleted: true });
        res.status(200).json({ status: "success", message: "Terms đã được xóa mềm" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi xóa mềm Terms" });
    }
};

// Xóa cứng Term
exports.hardDeleteTerm = async (req, res) => {
    const { id } = req.params;
    try {
        await Term.findByIdAndDelete(id);
        res.status(200).json({ status: "success", message: "Terms đã bị xóa vĩnh viễn" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi xóa cứng Terms" });
    }
};
