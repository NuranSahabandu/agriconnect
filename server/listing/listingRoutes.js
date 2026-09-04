// Defines Express routes for product search/filtering

const express = require("express");
const { searchProducts } = require("./listingController.js");

const router = express.Router();

router.get("/", searchProducts);

module.exports = router;
