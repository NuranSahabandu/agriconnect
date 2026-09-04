import { useLang } from "../context/LangContext.jsx";

export default function ProductDetailModal({ product, onClose }) {
  const { t } = useLang();

  if (!product) return null;

  const { name, category, quantity, price, location, contact } = product;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 text-xl leading-none text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>

        <h2 className="mb-4 text-lg font-semibold text-gray-800">{name}</h2>

        <dl className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt className="text-gray-500">{t("category")}</dt>
            <dd>{category}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{t("quantity")}</dt>
            <dd>{quantity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{t("price")}</dt>
            <dd>Rs. {price} / unit</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{t("location")}</dt>
            <dd>📍 {location}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Contact</dt>
            <dd>{contact}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
