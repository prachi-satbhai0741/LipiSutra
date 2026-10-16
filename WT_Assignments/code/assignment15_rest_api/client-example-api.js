// src/services/api.js  -  the client no longer holds any secret key
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export async function listManuscripts({ page = 1, script = "" } = {}) {
  const params = new URLSearchParams({ page, limit: 10 });
  if (script) params.set("script", script);

  const res = await fetch(`${BASE}/manuscripts?${params}`);
  if (!res.ok) throw new Error(`List failed: HTTP ${res.status}`);
  return res.json();
}

export async function createManuscript(record) {
  const res = await fetch(`${BASE}/manuscripts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join("; ") || data.error);
  return data;
}

export async function deleteManuscript(id) {
  const res = await fetch(`${BASE}/manuscripts/${id}`, { method: "DELETE" });
  if (res.status === 204) return true;
  const data = await res.json();
  throw new Error(data.error);
}
