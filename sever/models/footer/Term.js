const mongoose = require("mongoose");

const termSchema = new mongoose.Schema({
    banner_url: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false } 
}, { timestamps: true }); 

module.exports = mongoose.model("TermOfUse", termSchema);
