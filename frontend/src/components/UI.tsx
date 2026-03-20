import React from "react";

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, sub, accent = "#3b82f6", icon }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      animation: "fadeUp 0.4s ease both",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-bright)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "green" | "red" | "yellow" | "blue" | "gray";

const badgeColors: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green:  { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", dot: "#22c55e" },
  red:    { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", dot: "#ef4444" },
  yellow: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b" },
  blue:   { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", dot: "#3b82f6" },
  gray:   { bg: "rgba(100,116,139,0.1)", text: "#64748b", dot: "#64748b" },
};

export function Badge({ label, variant = "gray" }: { label: string; variant?: BadgeVariant }) {
  const c = badgeColors[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
      padding: "3px 8px", borderRadius: 999,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, animation: variant === "green" ? "pulse-dot 2s infinite" : "none" }} />
      {label}
    </span>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct > 80 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "var(--font-mono)", minWidth: 34, textAlign: "right" }}>{Math.round(pct)}%</span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, count, icon }: { title: string; count?: number; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ color: "#3b82f6" }}>{icon}</div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h2>
      {count !== undefined && (
        <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", background: "var(--border)", padding: "2px 8px", borderRadius: 999 }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ height = 20, width = "100%", style = {} }: { height?: number; width?: string | number; style?: React.CSSProperties }) {
  return (
    <div style={{
      height, width,
      background: "linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)",
      backgroundSize: "200% 100%",
      borderRadius: 6,
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

// ─── Error Box ────────────────────────────────────────────────────────────────
export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 10,
      color: "#ef4444",
      fontSize: 13,
      fontFamily: "var(--font-mono)",
    }}>
      ✕ {message}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{
                padding: "8px 12px", textAlign: "left",
                fontSize: 11, fontFamily: "var(--font-mono)",
                color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8,
                borderBottom: "1px solid var(--border)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </tr>
  );
}

export function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td style={{
      padding: "10px 12px",
      borderBottom: "1px solid var(--border)",
      color: "var(--text-primary)",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: mono ? 12 : 13,
    }}>
      {children}
    </td>
  );
}
