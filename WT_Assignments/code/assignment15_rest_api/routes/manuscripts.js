const express = require("express");
const pool    = require("../db");

const router = express.Router();

const SCRIPTS  = ["Modi", "Devanagari", "Brahmi", "Sharada"];
const STATUSES = ["pending", "verified"];

/* wrap an async handler so a rejected promise reaches the error middleware */
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------- validation helper ---------- */
function validate(body, { partial = false } = {}) {
  const errors = [];
  const has = k => body[k] !== undefined && body[k] !== null && body[k] !== "";

  if (!partial || has("accession")) {
    if (!/^LS-\d{4}$/.test(body.accession || ""))
      errors.push("accession must match LS-0000");
  }
  if (!partial || has("title")) {
    if (!body.title || body.title.trim().length < 5)
      errors.push("title must be at least 5 characters");
  }
  if (!partial || has("script")) {
    if (!SCRIPTS.includes(body.script))
      errors.push(`script must be one of ${SCRIPTS.join(", ")}`);
  }
  if (!partial || has("era_year")) {
    const y = Number(body.era_year);
    if (!Number.isInteger(y) || y < -500 || y > 2026)
      errors.push("era_year must be a whole number between -500 and 2026");
  }
  if (has("confidence")) {
    const c = Number(body.confidence);
    if (Number.isNaN(c) || c < 0 || c > 100)
      errors.push("confidence must be between 0 and 100");
  }
  if (has("status") && !STATUSES.includes(body.status)) {
    errors.push(`status must be one of ${STATUSES.join(", ")}`);
  }
  return errors;
}

/* =====================================================================
   GET /api/manuscripts
   Filtering  : ?script=Modi&status=verified&q=grant
   Pagination : ?page=1&limit=10
   ===================================================================== */
router.get("/", wrap(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const where  = [];
  const params = [];

  if (req.query.script) { where.push("script = ?"); params.push(req.query.script); }
  if (req.query.status) { where.push("status = ?"); params.push(req.query.status); }
  if (req.query.q) {
    where.push("(title LIKE ? OR accession LIKE ?)");
    params.push(`%${req.query.q}%`, `%${req.query.q}%`);
  }

  const clause = where.length ? "WHERE " + where.join(" AND ") : "";

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM manuscripts ${clause}`, params
  );

  const [rows] = await pool.query(
    `SELECT * FROM manuscripts ${clause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.status(200).json({
    page, limit, total,
    pages: Math.ceil(total / limit),
    data: rows
  });
}));

/* =====================================================================
   GET /api/manuscripts/:id
   ===================================================================== */
router.get("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const [rows] = await pool.query("SELECT * FROM manuscripts WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: `No manuscript with id ${id}` });
  }
  res.status(200).json(rows[0]);
}));

/* =====================================================================
   POST /api/manuscripts        -> 201 Created
   ===================================================================== */
router.post("/", wrap(async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { accession, title, script, era_year,
          confidence = 0, status = "pending", transcript = null } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO manuscripts
         (accession, title, script, era_year, confidence, status, transcript)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [accession, title.trim(), script, era_year, confidence, status, transcript]
    );

    const [rows] = await pool.query(
      "SELECT * FROM manuscripts WHERE id = ?", [result.insertId]
    );

    res.status(201)
       .location(`/api/manuscripts/${result.insertId}`)
       .json(rows[0]);

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: `accession ${accession} already exists` });
    }
    throw err;                       // anything else goes to the error middleware
  }
}));

/* =====================================================================
   PUT /api/manuscripts/:id      -> full replacement
   ===================================================================== */
router.put("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { accession, title, script, era_year,
          confidence = 0, status = "pending", transcript = null } = req.body;

  const [result] = await pool.query(
    `UPDATE manuscripts
        SET accession = ?, title = ?, script = ?, era_year = ?,
            confidence = ?, status = ?, transcript = ?
      WHERE id = ?`,
    [accession, title.trim(), script, era_year, confidence, status, transcript, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: `No manuscript with id ${id}` });
  }

  const [rows] = await pool.query("SELECT * FROM manuscripts WHERE id = ?", [id]);
  res.status(200).json(rows[0]);
}));

/* =====================================================================
   PATCH /api/manuscripts/:id    -> partial update
   ===================================================================== */
router.patch("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);

  const errors = validate(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const allowed = ["accession", "title", "script", "era_year",
                   "confidence", "status", "transcript"];
  const sets   = [];
  const params = [];

  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      sets.push(`${field} = ?`);         // field name comes from a fixed allow-list
      params.push(req.body[field]);
    }
  });

  if (sets.length === 0) {
    return res.status(400).json({ error: "Supply at least one field to update" });
  }

  params.push(id);
  const [result] = await pool.query(
    `UPDATE manuscripts SET ${sets.join(", ")} WHERE id = ?`, params
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: `No manuscript with id ${id}` });
  }

  const [rows] = await pool.query("SELECT * FROM manuscripts WHERE id = ?", [id]);
  res.status(200).json(rows[0]);
}));

/* =====================================================================
   DELETE /api/manuscripts/:id   -> 204 No Content
   ===================================================================== */
router.delete("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const [result] = await pool.query("DELETE FROM manuscripts WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: `No manuscript with id ${id}` });
  }
  res.status(204).send();              // success, nothing to return
}));

module.exports = router;
