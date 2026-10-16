const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ---------------------------------------------------------------
   1. BUILT-IN MIDDLEWARE
   --------------------------------------------------------------- */
app.use(express.json());                              // parse JSON bodies
app.use(express.urlencoded({ extended: true }));      // parse HTML form posts

/* ---------------------------------------------------------------
   2. CUSTOM MIDDLEWARE : a request logger
      Runs for every request, then calls next() to continue.
   --------------------------------------------------------------- */
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ` +
                `(${Date.now() - started} ms)`);
  });
  next();
});

/* ---------------------------------------------------------------
   3. STATIC RESOURCES
      public/index.html  -> http://localhost:3000/
      public/style.css   -> http://localhost:3000/style.css
      public/hero.png    -> http://localhost:3000/assets/hero.png
   --------------------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public")));

/* ---------------------------------------------------------------
   4. IN-MEMORY DATA (a database replaces this in Assignment 15)
   --------------------------------------------------------------- */
const manuscripts = [
  { accession: "LS-0101", title: "Modi Land Grant",          script: "Modi",
    year: 1712, confidence: 92.5, status: "verified" },
  { accession: "LS-0102", title: "Devanagari Verse Folio",   script: "Devanagari",
    year: 1588, confidence: 87.0, status: "verified" },
  { accession: "LS-0103", title: "Brahmi Rock Inscription",  script: "Brahmi",
    year: -230, confidence: 71.25, status: "pending" }
];

/* ---------------------------------------------------------------
   5. ROUTING
   --------------------------------------------------------------- */

// 5a. a simple route returning HTML
app.get("/about", (req, res) => {
  res.send(`<h1>LipiSutra</h1>
            <p>Server time: ${new Date().toLocaleString()}</p>
            <p><a href="/">Back to the home page</a></p>`);
});

// 5b. a route returning JSON
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
});

// 5c. QUERY STRING   /search?script=Modi&verified=true
app.get("/search", (req, res) => {
  const { script, verified } = req.query;
  let rows = manuscripts;

  if (script) {
    rows = rows.filter(m => m.script.toLowerCase() === script.toLowerCase());
  }
  if (verified === "true") {
    rows = rows.filter(m => m.status === "verified");
  }

  res.json({ query: req.query, count: rows.length, results: rows });
});

// 5d. ROUTE PARAMETER   /manuscripts/LS-0101
//     registered AFTER /search so the literal path is not shadowed
app.get("/manuscripts/:accession", (req, res) => {
  const found = manuscripts.find(
    m => m.accession.toUpperCase() === req.params.accession.toUpperCase()
  );

  if (!found) {
    return res.status(404).json({ error: `No manuscript ${req.params.accession}` });
  }
  res.json(found);
});

// 5e. a POST route reading a JSON body
app.post("/manuscripts", (req, res) => {
  const { accession, title, script, year } = req.body;

  if (!accession || !title || !script) {
    return res.status(400).json({ error: "accession, title and script are required" });
  }

  const record = { accession, title, script, year: Number(year) || 0,
                   confidence: 0, status: "pending" };
  manuscripts.push(record);
  res.status(201).json(record);
});

// 5f. a route that deliberately throws, to exercise the error handler
app.get("/boom", (req, res) => {
  throw new Error("Simulated server failure");
});

/* ---------------------------------------------------------------
   6. 404 HANDLER - reached only if no route above matched
   --------------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).send(`<h1>404 - Not Found</h1>
                        <p>No route for ${req.method} ${req.originalUrl}</p>`);
});

/* ---------------------------------------------------------------
   7. ERROR HANDLER - four arguments, so Express treats it as one
   --------------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

/* ---------------------------------------------------------------
   8. START
   --------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`LipiSutra server listening on http://localhost:${PORT}`);
});
