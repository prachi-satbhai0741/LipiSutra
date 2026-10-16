require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const manuscriptRoutes = require("./routes/manuscripts");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ---------- middleware ---------- */
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));   // allow the React client
app.use(express.json());

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () =>
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - t0} ms)`)
  );
  next();
});

/* ---------- routes ---------- */
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) })
);

app.use("/api/manuscripts", manuscriptRoutes);     // mount the resource router

/* ---------- 404 ---------- */
app.use((req, res) =>
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` })
);

/* ---------- centralised error handler ---------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

app.listen(PORT, () =>
  console.log(`LipiSutra REST API listening on http://localhost:${PORT}`)
);
