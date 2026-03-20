import { useState } from "react";
import { sendAlert } from "../hooks/useAWS";

export default function AlertSender() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const inputStyle = {
    width: "100%",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--text-primary)",
    fontSize: 13,
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await sendAlert(subject, message);
      if (res.success) {
        setStatus("sent");
        setSubject("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setErrorMsg(res.error || "Failed to send");
        setStatus("error");
      }
    } catch (e) {
      setErrorMsg("Network error");
      setStatus("error");
    }
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, animation: "fadeUp 0.65s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ color: "#f59e0b" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Send SNS Alert</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Alert subject"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = "var(--accent-blue)")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Alert message body..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={e => (e.target.style.borderColor = "var(--accent-blue)")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")}
        />

        <button
          onClick={handleSend}
          disabled={status === "sending" || !subject.trim() || !message.trim()}
          style={{
            padding: "9px 18px",
            background: status === "sent" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
            border: `1px solid ${status === "sent" ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}`,
            color: status === "sent" ? "#22c55e" : "#3b82f6",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: status === "sending" ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            alignSelf: "flex-start",
          }}
        >
          {status === "sending" ? "Sending..." : status === "sent" ? "✓ Alert Sent!" : "Send Alert via SNS"}
        </button>

        {status === "error" && (
          <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "var(--font-mono)" }}>✕ {errorMsg}</div>
        )}
      </div>
    </div>
  );
}
