type StatProps = {
  title: string;
  value: number;
  blue?: boolean;
  amber?: boolean;
  red?: boolean;
  green?: boolean;
};

export default function Stat({
  title,
  value,
  blue,
  amber,
  red,
  green,
}: StatProps) {
  return (
    <div className="metric-card" style={{ padding: 16, borderRadius: 12 }}>
      <p style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>{title}</p>
      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: blue
            ? "var(--primary)"
            : amber
              ? "var(--warning)"
              : red
                ? "var(--error)"
                : green
                  ? "var(--secondary)"
                  : "var(--on-surface)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
