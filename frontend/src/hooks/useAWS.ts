import { useState, useEffect, useCallback } from "react";

const BASE = "/api";

export function useFetch<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}${url}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Unknown error");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { refetch(); }, [refetch, ...deps]);

  return { data, loading, error, refetch };
}

export interface EC2Instance {
  id: string;
  name: string;
  type: string;
  state: "running" | "stopped" | "pending" | "terminated";
  region: string;
  launchTime: string;
  publicIp: string | null;
  privateIp: string | null;
}

export interface S3Bucket {
  name: string;
  creationDate: string;
  region: string;
  objectCount: number;
  access: "Public" | "Private";
}

export interface LambdaFunction {
  name: string;
  runtime: string;
  handler: string;
  memorySize: number;
  timeout: number;
  lastModified: string;
  codeSize: number;
  state: string;
}

export interface Summary {
  ec2: { total: number; running: number; stopped: number };
  s3: { total: number };
  lambda: { total: number };
}

export function useSummary() {
  return useFetch<Summary>("/summary");
}

export function useEC2() {
  return useFetch<EC2Instance[]>("/ec2");
}

export function useS3() {
  return useFetch<S3Bucket[]>("/s3");
}

export function useLambda() {
  return useFetch<LambdaFunction[]>("/lambda");
}

export async function sendAlert(subject: string, message: string) {
  const res = await fetch(`${BASE}/alerts/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, message }),
  });
  return res.json();
}
