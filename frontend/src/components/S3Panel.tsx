import { useS3 } from "../hooks/useAWS";
import { Badge, ErrorBox, SectionHeader, Skeleton, Table, Td, Tr } from "./UI";

export default function S3Panel() {
  const { data, loading, error, refetch } = useS3();

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, animation: "fadeUp 0.55s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionHeader
          title="S3 Buckets"
          count={data?.length}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
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
        <Table headers={["Bucket Name", "Region", "Objects", "Access", "Created"]}>
          {data.map(bucket => (
            <Tr key={bucket.name}>
              <Td mono>{bucket.name}</Td>
              <Td mono>{bucket.region}</Td>
              <Td mono>{bucket.objectCount.toLocaleString()}</Td>
              <Td>
                <Badge
                  label={bucket.access}
                  variant={bucket.access === "Public" ? "yellow" : "blue"}
                />
              </Td>
              <Td>{new Date(bucket.creationDate).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}
