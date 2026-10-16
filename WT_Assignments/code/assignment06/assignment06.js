"use strict";

// ---------- sample data : the LipiSutra archive ----------
const manuscripts = [
  { id: "M-101", script: "Modi",        era: "1712 CE", confidence: 0.92, status: "verified" },
  { id: "M-102", script: "Devanagari",  era: "1588 CE", confidence: 0.87, status: "verified" },
  { id: "M-103", script: "Brahmi",      era: "230 BCE", confidence: 0.71, status: "pending"  },
  { id: "M-104", script: "Sharada",     era: "1104 CE", confidence: 0.80, status: "pending"  },
  { id: "M-105", script: "Modi",        era: "1680 CE", confidence: 0.95, status: "verified" }
];

const listEl   = document.getElementById("list");
const statsEl  = document.getElementById("stats");
const searchEl = document.getElementById("search");

// ---------- render helper : map() + join() ----------
function render(rows) {
  if (rows.length === 0) {
    listEl.innerHTML = "<li>No manuscripts match.</li>";
    return;
  }
  listEl.innerHTML = rows
    .map(m => `<li><b>${m.id}</b> - ${m.script} (${m.era}) - `
             + `${Math.round(m.confidence * 100)}% - ${m.status}</li>`)
    .join("");
}

// ---------- EVENT 1 : click ----------
document.getElementById("btn-all")
  .addEventListener("click", () => render(manuscripts));

// ---------- EVENT 2 : click + filter() ----------
document.getElementById("btn-verified").addEventListener("click", () => {
  const verified = manuscripts.filter(m => m.status === "verified");
  render(verified);
});

// ---------- EVENT 3 : click + reduce() / find() / some() ----------
document.getElementById("btn-stats").addEventListener("click", () => {
  const total = manuscripts.reduce((sum, m) => sum + m.confidence, 0);
  const avg   = (total / manuscripts.length) * 100;

  const best    = manuscripts.find(m => m.confidence >= 0.95);
  const anyLow  = manuscripts.some(m => m.confidence < 0.75);

  // sort on a COPY so the original order is preserved
  const ranked = [...manuscripts].sort((a, b) => b.confidence - a.confidence);

  statsEl.textContent =
    `Average confidence ${avg.toFixed(1)}% | ` +
    `best = ${best ? best.id : "none"} | ` +
    `needs review = ${anyLow ? "yes" : "no"} | ` +
    `ranked = ${ranked.map(m => m.id).join(" > ")}`;
});

// ---------- EVENT 4 : keydown on a text input ----------
searchEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const term = e.target.value.trim().toLowerCase();
  const hits = manuscripts.filter(m => m.script.toLowerCase().includes(term));
  render(hits);
});

// ---------- EVENT 5 : page load, with forEach() for a side effect ----------
window.addEventListener("DOMContentLoaded", () => {
  manuscripts.forEach(m => console.log("Loaded", m.id, m.script));
  render(manuscripts);
});
