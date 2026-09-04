// Holds business logic for searching/filtering products from data.js


function searchProducts(products, filters = {}) {
  const { search, category, location, maxPrice, sortBy } = filters;

  let result = [...products];

  if (search) {
    const term = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (category && category !== "All") {
    result = result.filter((p) => p.category === category);
  }

  if (location) {
    const term = location.toLowerCase();
    result = result.filter((p) => p.location.toLowerCase().includes(term));
  }

  if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
    const max = Number(maxPrice);
    result = result.filter((p) => p.price <= max);
  }

  if (sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

module.exports = { searchProducts };