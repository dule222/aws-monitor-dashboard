import { useState } from "react";
import { useSummary } from "./hooks/useAWS";
import { StatCard, Skeleton } from "./components/UI";
import EC2Panel from "./components/EC2Panel";
import S3Panel from "./components/S3Panel";
import LambdaPanel from "./components/LambdaPanel";
import AlertSender from "./components/AlertSender";

type Tab = "overview" | "ec2" | "s3" | "lambda" | "alerts";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "ec2", label: "EC2" },
  { id: "s3", label: "S3" },
  { id: "lambda", label: "Lambda" },
  { id: "alerts", label: "Alerts" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: summary, loading } = useSummary();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Top Nav */}
      <header style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        height: 58,
        gap: 32,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#3b82f6",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6.5 19C4.01 19 2 16.99 2 14.5c0-2.23 1.57-4.1 3.67-4.47A5.5 5.5 0 0 1 10.5 2c2.55 0 4.68 1.7 5.33 4.02.22-.01.45-.02.67-.02C19.54 6 22 8.46 22 11.5c0 2.53-1.69 4.67-4 5.33" />
              <path d="M12 13l-2 4h4l-2 4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>CloudMonitor</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>AWS Infrastructure</div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: "flex", gap: 2, flex: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 14px",
                background: activeTab === tab.id ? "rgba(59,130,246,0.1)" : "transparent",
                border: activeTab === tab.id ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                borderRadius: 7,
                color: activeTab === tab.id ? "#3b82f6" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Region badge */}
        <div style={{
          fontSize: 11, fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
          background: "var(--bg-hover)",
          border: "1px solid var(--border)",
          padding: "4px 10px", borderRadius: 6,
        }}>
          {import.meta.env.VITE_AWS_REGION || "us-east-1"}
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Overview / Stats row — always visible */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}>
          <StatCard
            label="EC2 Running"
            value={loading ? "—" : summary?.ec2.running ?? 0}
            sub={loading ? "" : `${summary?.ec2.total ?? 0} total instances`}
            accent="#22c55e"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            }
          />
          <StatCard
            label="EC2 Stopped"
            value={loading ? "—" : summary?.ec2.stopped ?? 0}
            sub="Instances not running"
            accent="#ef4444"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" />
              </svg>
            }
          />
          <StatCard
            label="S3 Buckets"
            value={loading ? "—" : summary?.s3.total ?? 0}
            sub="Total buckets"
            accent="#06b6d4"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              </svg>
            }
          />
          <StatCard
            label="Lambda Functions"
            value={loading ? "—" : summary?.lambda.total ?? 0}
            sub="Deployed functions"
            accent="#f59e0b"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
          />
        </div>

        {/* Tab panels */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <EC2Panel />
            <S3Panel />
            <LambdaPanel />
          </div>
        )}
        {activeTab === "ec2" && <EC2Panel />}
        {activeTab === "s3" && <S3Panel />}
        {activeTab === "lambda" && <LambdaPanel />}
        {activeTab === "alerts" && (
          <div style={{ maxWidth: 540 }}>
            <AlertSender />
          </div>
        )}
      </main>
    </div>
  );
}
