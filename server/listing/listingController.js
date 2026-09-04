// Handles request/response logic for product listing endpoints

const Product = require("../models/Product.js");
const { searchProducts: searchProductsService } = require("./listingService.js");

async function searchProducts(req, res) {
  try {
    const { search, category, location, maxPrice, sortBy } = req.query;

    const filters = {
      search,
      category,
      location,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      sortBy,
    };

    const products = await Product.find();
    const results = searchProductsService(products, filters);

    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { searchProducts };
