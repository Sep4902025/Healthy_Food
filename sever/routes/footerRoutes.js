const express = require("express");
const router = express.Router();

// Import Controllers
const { getAllFAQs, createFAQ, updateFAQ, hardDeleteFAQ } = require("../controllers/footer/faqController");
const { getAllAboutUs, createAboutUs, updateAboutUs, hardDeleteAboutUs } = require("../controllers/footer/aboutController");
const { getAllContactUs, createContactUs, updateContactUs, hardDeleteContactUs } = require("../controllers/footer/contactController");
const { getAllTerms, createTerm, updateTerm, hardDeleteTerm } = require("../controllers/footer/termController");

// APIs FAQs
router.get("/faqs", getAllFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/hard/:id", hardDeleteFAQ); // Xóa cứng

// APIs AboutUs
router.get("/about", getAllAboutUs);
router.post("/about", createAboutUs);
router.put("/about/:id", updateAboutUs);
router.delete("/about/hard/:id", hardDeleteAboutUs); // Xóa cứng

// APIs ContactUs
router.get("/contact", getAllContactUs);
router.post("/contact", createContactUs);
router.put("/contact/:id", updateContactUs);
router.delete("/contact/hard/:id", hardDeleteContactUs); // Xóa cứng

// APIs TermsOfUse
router.get("/terms", getAllTerms);
router.post("/terms", createTerm);
router.put("/terms/:id", updateTerm);
router.delete("/terms/hard/:id", hardDeleteTerm); // Xóa cứng

module.exports = router;
