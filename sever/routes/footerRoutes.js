const express = require("express");
const router = express.Router();

// Import Controllers
const { getAllFAQs, createFAQ, updateFAQ, softDeleteFAQ, hardDeleteFAQ } = require("../controllers/footer/faqController");
const { getAllAboutUs, createAboutUs, updateAboutUs, softDeleteAboutUs, hardDeleteAboutUs } = require("../controllers/footer/aboutController");
const { getAllContactUs, createContactUs, updateContactUs, softDeleteContactUs, hardDeleteContactUs } = require("../controllers/footer/contactController");
const { getAllTerms, createTerm, updateTerm, softDeleteTerm, hardDeleteTerm } = require("../controllers/footer/termController");

// APIs FAQs
router.get("/faqs", getAllFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", softDeleteFAQ); // Xóa mềm
router.delete("/faqs/hard/:id", hardDeleteFAQ); // Xóa cứng

// APIs AboutUs
router.get("/about", getAllAboutUs);
router.post("/about", createAboutUs);
router.put("/about/:id", updateAboutUs);
router.delete("/about/:id", softDeleteAboutUs); // Xóa mềm
router.delete("/about/hard/:id", hardDeleteAboutUs); // Xóa cứng

// APIs ContactUs
router.get("/contact", getAllContactUs);
router.post("/contact", createContactUs);
router.put("/contact/:id", updateContactUs);
router.delete("/contact/:id", softDeleteContactUs); // Xóa mềm
router.delete("/contact/hard/:id", hardDeleteContactUs); // Xóa cứng

// APIs TermsOfUse
router.get("/terms", getAllTerms);
router.post("/terms", createTerm);
router.put("/terms/:id", updateTerm);
router.delete("/terms/:id", softDeleteTerm); // Xóa mềm
router.delete("/terms/hard/:id", hardDeleteTerm); // Xóa cứng

module.exports = router;
