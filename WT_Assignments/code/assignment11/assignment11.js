"use strict";

// ---------- 1. SELECTING NODES ----------
const shelf    = document.getElementById("shelf");
const input    = document.getElementById("newScript");
const dropzone = document.getElementById("dropzone");
const preview  = document.getElementById("preview");
const log      = document.getElementById("log");

let counter = 100;

// ---------- 2. CREATING AND INSERTING NODES ----------
function addManuscript(scriptName) {
  counter += 1;

  const li = document.createElement("li");          // create
  li.dataset.id = "M-" + counter;                   // data-* attribute
  li.setAttribute("title", "Click to toggle verification");

  const label = document.createElement("span");     // nested child
  label.textContent = `M-${counter} - ${scriptName}`;   // safe text insertion

  const del = document.createElement("button");
  del.textContent = "Remove";
  del.className   = "remove-btn";

  li.appendChild(label);                            // insert
  li.appendChild(del);
  shelf.appendChild(li);

  log.textContent = `Added M-${counter}. Shelf now holds ` +
                    `${shelf.querySelectorAll("li").length} manuscripts.`;
}

// ---------- 3. EVENT HANDLING : click ----------
document.getElementById("addBtn").addEventListener("click", () => {
  const value = input.value.trim();
  if (value === "") { log.textContent = "Type a script name first."; return; }
  addManuscript(value);
  input.value = "";
  input.focus();
});

// ---------- 4. EVENT HANDLING : keydown on an input ----------
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addBtn").click();
});

// ---------- 5. EVENT DELEGATION : one handler for every current and future row ----------
shelf.addEventListener("click", (e) => {
  const row = e.target.closest("li");
  if (!row) return;                                 // clicked the empty area

  if (e.target.classList.contains("remove-btn")) {
    e.stopPropagation();                            // do not also toggle the row
    row.remove();                                   // REMOVING A NODE
    log.textContent = `Removed ${row.dataset.id}.`;
    return;
  }

  row.classList.toggle("verified");                 // MODIFYING CLASSES
  const state = row.classList.contains("verified") ? "verified" : "pending";
  log.textContent = `${row.dataset.id} marked ${state}. ` +
                    `(target=${e.target.tagName}, currentTarget=${e.currentTarget.id})`;
});

// ---------- 6. CLEARING : removing many nodes ----------
document.getElementById("clearBtn").addEventListener("click", () => {
  while (shelf.firstChild) shelf.removeChild(shelf.firstChild);
  log.textContent = "Shelf cleared.";
});

// ---------- 7. DRAG AND DROP with preventDefault ----------
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();                               // required or 'drop' never fires
  dropzone.classList.add("hot");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("hot"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();                               // stop the browser opening the file
  dropzone.classList.remove("hot");

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) {
    log.textContent = "Drop an image file.";
    return;
  }
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";                  // MODIFYING INLINE STYLE
  log.textContent = `Loaded ${file.name} (${(file.size / 1024).toFixed(0)} KB).`;
});

// ---------- 8. A ONE-SHOT LISTENER ----------
window.addEventListener("DOMContentLoaded", () => {
  ["Modi", "Devanagari", "Brahmi"].forEach(addManuscript);
  log.textContent = "Shelf initialised with three manuscripts.";
}, { once: true });
