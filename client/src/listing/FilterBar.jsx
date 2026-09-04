import { useLang } from "../context/LangContext.jsx";

const CATEGORIES = ["All", "Vegetable", "Fruit", "Grain", "Other"];

const inputClasses =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500";

export default function FilterBar({ filters, onChange }) {
  const { t } = useLang();
  const { category = "All", location = "", maxPrice = "", sortBy = "" } = filters || {};

  const updateField = (field, fieldValue) => {
    onChange({ ...filters, [field]: fieldValue });
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-green-100 bg-green-50/50 p-3 md:flex-row md:items-center">
      <select
        value={category}
        onChange={(e) => updateField("category", e.target.value)}
        className={inputClasses + " md:w-40"}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c === "All" ? t("allCategories") : c}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={location}
        onChange={(e) => updateField("location", e.target.value)}
        placeholder={t("location")}
        className={inputClasses + " md:w-40"}
      />

      <input
        type="number"
        value={maxPrice}
        onChange={(e) => updateField("maxPrice", e.target.value)}
        placeholder={t("maxPrice")}
        min="0"
        className={inputClasses + " md:w-32"}
      />

      <select
        value={sortBy}
        onChange={(e) => updateField("sortBy", e.target.value)}
        className={inputClasses + " md:w-48"}
      >
        <option value="">{t("sortBy")}</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
