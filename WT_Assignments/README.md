# Web Technologies (102606) — Term Work

Lab assignments 1–15, mapped against the **LipiSutra** course project.

Each assignment is a standalone document in the KBTCOE lab-manual format:
**Title → Aim → Objectives → Hardware Used → Software Used → Theory →
Course Project Implementation → Program → Output → Conclusion → References.**

The *Course Project Implementation* section of every document states plainly whether an
existing LipiSutra file satisfies that assignment, names the exact file(s) and the lines
that prove it, or explains why nothing in the project qualifies.

## Contents

```
WT_Assignments/
├── 00_Assignment_Project_Mapping.docx / .pdf   one-page summary of all 15 verdicts
├── docx/                                        15 assignment documents (.docx)
├── pdf/                                         the same 15 documents (.pdf)
└── code/                                        runnable source for the newly-written ones
```

## Verdict summary

| # | Assignment | Verdict | Submit |
|---|---|---|---|
| 1 | Basic HTML: headings, lists, images | not in project | `code/assignment01/` |
| 2 | Semantic HTML tags | partial | `code/assignment02/` + cite `src/App.jsx`, `src/components/Navbar.jsx` |
| 3 | CSS inline / internal / external | **in project** | `src/index.css`, `src/App.jsx`, `src/components/UploadSection.jsx` |
| 4 | Responsive: Flexbox, Grid, media queries | **in project** | `src/components/ResultCard.jsx`, `Navbar.jsx`, `PublicView.jsx` |
| 5 | CSS positions & other properties | **in project** | `src/components/Navbar.jsx`, `UploadSection.jsx`, `src/index.css` |
| 6 | Link JS file, events, array functions | **in project** | `src/services/vision.js`, `src/components/Navbar.jsx`, `HistorianView.jsx` |
| 7 | JS frontend + form validation | not in project | `code/assignment07/` |
| 8 | Basic SPA with React + JSX | **in project** | `index.html`, `src/main.jsx`, `src/App.jsx` |
| 9 | React props, state, hooks, events, conditional | **in project** | `src/components/MuseumView.jsx`, `PublicView.jsx`, `ResultCard.jsx` |
| 10 | Fetch + JSON | **in project** | `src/services/translate.js`, `gemini.js`, `vision.js` |
| 11 | DOM manipulation + event handling | **in project** | `src/components/MapSection.jsx`, `UploadSection.jsx` |
| 12 | PHP form, validation, strings, sessions | not in project | `code/assignment12_php/` |
| 13 | PHP-MySQL CRUD | not in project | `code/assignment13_php_mysql/` |
| 14 | Node.js + Express server, routing, static | not in project | `code/assignment14_express/` |
| 15 | REST API: Node, Express, database | not in project | `code/assignment15_rest_api/` |

Assignments 3–6 and 8–11 are satisfied by LipiSutra as it stands — those documents quote the
project's own code. Assignments 1, 2, 7 and 12–15 need code the project does not contain
(it has no PHP, no MySQL and no Node backend), so that code was written for this term work
and is reproduced in full inside each document as well as living under `code/`.

## Running the supplied code

| Folder | How to run |
|---|---|
| `assignment01`, `assignment02`, `assignment04`, `assignment06`, `assignment07`, `assignment11` | Open the `.html` file in a browser |
| `assignment12_php` | Copy into `htdocs/`, start Apache (XAMPP), open `login.php` — demo login `prachi` / `Lipi@2026` |
| `assignment13_php_mysql` | Import `lipisutra.sql` in phpMyAdmin, copy into `htdocs/`, open `index.php` |
| `assignment14_express` | `npm install && node server.js` → http://localhost:3000 |
| `assignment15_rest_api` | Copy `.env.example` to `.env`, `npm install && node server.js` → http://localhost:3000/api/manuscripts |

### Verification performed

- All PHP files pass `php -l` (no syntax errors).
- All JavaScript files pass `node --check`.
- The Assignment 14 Express server was started and every documented route exercised with
  `curl`; the status codes and response bodies in that document's **Output** section are the
  actual observed responses (200, 201, 400, 404, 500, and static files served from `public/`).
- Assignments 13 and 15 require a running MySQL server, which was not available in this
  environment, so their outputs are the expected responses rather than captured ones.

## Note on Assignment 16 (Course Project)

Index entry 16 is the course project itself — submit the LipiSutra repository as a whole for
that one.
