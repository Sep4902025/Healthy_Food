const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin, isNutritionist } = require("../middlewares/isAuthenticated");
const {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  hardDeleteFAQ,
  getAllAboutUs,
  createAboutUs,
  updateAboutUs,
  hardDeleteAboutUs,
  getAllContactUs,
  createContactUs,
  updateContactUs,
  hardDeleteContactUs,
  getAllTerms,
  createTerm,
  updateTerm,
  hardDeleteTerm,
} = require("../controllers/footerController");

// APIs FAQs
router.get("/faqs", getAllFAQs);
router.post("/faqs", isAuthenticated, isAdmin, createFAQ);
router.put("/faqs/:id", isAuthenticated, isAdmin, updateFAQ);
router.delete("/faqs/hard/:id", isAuthenticated, isAdmin, hardDeleteFAQ);

// APIs AboutUs
router.get("/about", getAllAboutUs);
router.post("/about", isAuthenticated, isAdmin, createAboutUs);
router.put("/about/:id", isAuthenticated, isAdmin, updateAboutUs);
router.delete("/about/hard/:id", isAuthenticated, isAdmin, hardDeleteAboutUs);

// APIs ContactUs
router.get("/contact", getAllContactUs);
router.post("/contact", isAuthenticated, createContactUs);
router.put("/contact/:id", isAuthenticated, isAdmin, updateContactUs);
router.delete("/contact/hard/:id", isAuthenticated, isAdmin, hardDeleteContactUs);

// APIs TermsOfUse
router.get("/terms", getAllTerms);
router.post("/terms", isAuthenticated, isAdmin, createTerm);
router.put("/terms/:id", isAuthenticated, isAdmin, updateTerm);
router.delete("/terms/hard/:id", isAuthenticated, isAdmin, hardDeleteTerm);

module.exports = router;
