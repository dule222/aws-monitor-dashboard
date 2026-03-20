import { useLambda } from "../hooks/useAWS";
import { Badge, ErrorBox, SectionHeader, Skeleton, Table, Td, Tr } from "./UI";

function runtimeVariant(runtime: string) {
  if (runtime.startsWith("python")) return "blue";
  if (runtime.startsWith("nodejs")) return "green";
  if (runtime.startsWith("java")) return "yellow";
  return "gray";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LambdaPanel() {
  const { data, loading, error, refetch } = useLambda();

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, animation: "fadeUp 0.6s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionHeader
          title="Lambda Functions"
          count={data?.length}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
        />
        <button
          onClick={refetch}
          style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-hover)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-mono)" }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={36} />)}
        </div>
      )}

      {error && <ErrorBox message={error} />}

      {data && (
        <Table headers={["Function", "Runtime", "Memory", "Timeout", "Code Size", "Last Modified"]}>
          {data.map(fn => (
            <Tr key={fn.name}>
              <Td mono>{fn.name}</Td>
              <Td>
                <Badge label={fn.runtime} variant={runtimeVariant(fn.runtime) as "blue" | "green" | "yellow" | "gray"} />
              </Td>
              <Td mono>{fn.memorySize} MB</Td>
              <Td mono>{fn.timeout}s</Td>
              <Td mono>{formatBytes(fn.codeSize)}</Td>
              <Td>{new Date(fn.lastModified).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}
