const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    banner_url: { type: String, required: true },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false } 
}, { timestamps: true }); 

module.exports = mongoose.model("AboutUs", aboutSchema);
    