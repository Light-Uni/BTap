import { X, Pencil, ArchiveRestore } from "lucide-react";
import type { Medicine } from "../types/medicine";

type Props = {
  medicine: Medicine;
  role?: string;
  onEdit?: (medicine: Medicine) => void;
  onDelete?: (medicine: Medicine) => void;
  onRestore?: (medicine: Medicine) => void;
};

const BASE_URL = "http://localhost:3000";

export default function MedicineCard({
  medicine,
  role,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div
      className={`medicine-card relative w-full h-66 flex flex-col items-center justify-center ${
        medicine.is_deleted ? "medicine-card--deleted opacity-80" : ""
      }`}
    >
      {/* 🔴 BADGE (KHÔNG bị grayscale) */}
      {Boolean(medicine.is_deleted) && (
        <div className="medicine-card__badge absolute top-1 left-2 text-xs px-2 py-1 rounded-md z-20">
          Tạm ngừng nhập kho
        </div>
      )}
      {/* ACTION BUTTONS */}
      {role === "MANAGER" && (
        <div className="absolute top-2 right-2 flex gap-2">
          {!medicine.is_deleted ? (
            <>
              {/* EDIT */}
              <button
                onClick={() => onEdit?.(medicine)}
                className="medicine-card__icon-button p-1 rounded-full"
              >
                <Pencil size={16} />
              </button>

              {/* DELETE */}
              <button
                onClick={() => onDelete?.(medicine)}
                className="medicine-card__icon-button medicine-card__icon-button--danger p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            /* 🔓 RESTORE */
            <button
              onClick={() => onRestore?.(medicine)}
              className="medicine-card__icon-button p-1 rounded-full"
            >
              <ArchiveRestore size={16} />
            </button>
          )}
        </div>
      )}

      <div
        className={`flex flex-col items-center ${
          medicine.is_deleted ? "grayscale opacity-60" : ""
        }`}
      >
        <img
          src={`${BASE_URL}${medicine.img_path}`}
          alt={medicine.name}
          className="flex-1 max-h-35 max-w-full object-contain mt-3"
        />

        <div className="p-3 text-center">
          <h2 className="medicine-card__title text-lg font-semibold">
            {medicine.name}
          </h2>

          <p className="medicine-card__description text-sm mt-1 line-clamp-2">
            {medicine.description}
          </p>
        </div>
      </div>
    </div>
  );
}
