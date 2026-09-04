import { useLang } from "../context/LangContext.jsx";

const CATEGORY_EMOJI = {
  Vegetable: "🍅",
  Fruit: "🍎",
  Grain: "🌾",
  Other: "📦",
};

export default function ProductCard({ product, onViewClick }) {
  const { t } = useLang();
  const { id, name, category, quantity, price, location } = product;
  const emoji = CATEGORY_EMOJI[category] || CATEGORY_EMOJI.Other;

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-800">{name}</h3>
        <span className="whitespace-nowrap rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {emoji} {category}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {t("quantity")}: {quantity}
      </p>
      <p className="text-sm font-medium text-gray-800">
        {t("price")}: Rs. {price}{" "}
        <span className="font-normal text-gray-500">/ unit</span>
      </p>
      <p className="flex items-center gap-1 text-sm text-gray-600">
        📍 {location}
      </p>

      <button
        type="button"
        onClick={() => onViewClick(id)}
        className="mt-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {t("viewProduct")}
      </button>
    </div>
  );
}
