import type { Medicine } from "../types/medicine";
import { usePreferences } from "../app/preferences";

interface Props {
  products: Medicine[];
  value: number | null; // 👈 FIX ở đây
  onChange: (id: number) => void;
}

export default function ProductSelector({ products, value, onChange }: Props) {
  const { language } = usePreferences();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
        {language === "en" ? "Medicine type" : "Loại thuốc"}
      </label>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="wms-input"
      >
        <option value="" disabled>
          {language === "en" ? "-- Select medicine --" : "-- Chọn thuốc --"}
        </option>

        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
