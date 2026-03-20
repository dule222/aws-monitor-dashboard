import { useEC2 } from "../hooks/useAWS";
import { Badge, ErrorBox, SectionHeader, Skeleton, Table, Td, Tr } from "./UI";

function stateVariant(state: string) {
  if (state === "running") return "green";
  if (state === "stopped") return "red";
  if (state === "pending") return "yellow";
  return "gray";
}

export default function EC2Panel() {
  const { data, loading, error, refetch } = useEC2();

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionHeader
          title="EC2 Instances"
          count={data?.length}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
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
        <Table headers={["Name", "ID", "Type", "State", "Region", "Public IP"]}>
          {data.map(inst => (
            <Tr key={inst.id}>
              <Td>{inst.name}</Td>
              <Td mono>{inst.id}</Td>
              <Td mono>{inst.type}</Td>
              <Td><Badge label={inst.state} variant={stateVariant(inst.state) as "green" | "red" | "yellow" | "gray"} /></Td>
              <Td mono>{inst.region}</Td>
              <Td mono>{inst.publicIp || "—"}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}
