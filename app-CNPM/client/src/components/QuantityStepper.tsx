interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function QuantityStepper({ value, onChange }: Props) {
  return (
    <div className="quantity-stepper">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="btn btn-secondary quantity-stepper-btn"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <input
        type="number"
        value={value}
        min={1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="wms-input quantity-stepper-input"
      />

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="btn btn-secondary quantity-stepper-btn"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
