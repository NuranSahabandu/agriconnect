// Handles request/response logic for product listing endpoints

const { products } = require("../data.js");
const { searchProducts: searchProductsService } = require("./listingService.js");

function searchProducts(req, res) {
  try {
    const { search, category, location, maxPrice, sortBy } = req.query;

    const filters = {
      search,
      category,
      location,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      sortBy,
    };

    const results = searchProductsService(products, filters);

    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { searchProducts };
