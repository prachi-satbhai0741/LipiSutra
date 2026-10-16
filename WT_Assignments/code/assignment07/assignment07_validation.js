"use strict";

const form   = document.getElementById("submitForm");
const banner = document.getElementById("banner");

// ---------- rule table : one entry per field ----------
const RULES = {
  name: {
    test: v => /^[A-Za-z ]{3,40}$/.test(v.trim()),
    msg:  "Enter 3 to 40 letters only (no digits or symbols)."
  },
  email: {
    test: v => /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(v.trim()),
    msg:  "Enter a valid email address, for example you@example.com."
  },
  mobile: {
    test: v => /^[6-9][0-9]{9}$/.test(v.trim()),
    msg:  "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."
  },
  accession: {
    test: v => /^LS-[0-9]{4}$/.test(v.trim().toUpperCase()),
    msg:  "Accession number must look like LS-0147."
  },
  script: {
    test: v => v !== "",
    msg:  "Select the expected script."
  },
  year: {
    test: v => v !== "" && Number(v) >= -500 && Number(v) <= 2026,
    msg:  "Year must be between -500 and 2026."
  },
  notes: {
    test: v => v.length <= 200,
    msg:  "Provenance notes cannot exceed 200 characters."
  }
};

const MAX_BYTES    = 5 * 1024 * 1024;              // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png"];

// ---------- show / clear a field-level message ----------
function setError(id, message) {
  const field = document.getElementById(id);
  const slot  = document.getElementById("err-" + id);
  slot.textContent = message;
  field.classList.toggle("bad", Boolean(message));
  field.classList.toggle("ok", !message && field.value !== "");
  // feed the message into the Constraint Validation API as well
  field.setCustomValidity(message);
}

// ---------- validate one text / select / number field ----------
function validateField(id) {
  const field = document.getElementById(id);
  const rule  = RULES[id];
  if (!rule) return true;

  if (field.required && field.value.trim() === "") {
    setError(id, "This field is required.");
    return false;
  }
  if (field.value.trim() !== "" && !rule.test(field.value)) {
    setError(id, rule.msg);
    return false;
  }
  setError(id, "");
  return true;
}

// ---------- validate the file input : type and size ----------
function validateFile() {
  const input = document.getElementById("artifact");
  const file  = input.files[0];

  if (!file) {
    setError("artifact", "Please choose an artifact image.");
    return false;
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    setError("artifact", `Unsupported type "${file.type}". Upload a JPG or PNG.`);
    return false;
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    setError("artifact", `File is ${mb} MB. The limit is 5 MB.`);
    return false;
  }
  setError("artifact", "");
  return true;
}

// ---------- live validation on blur and on input ----------
Object.keys(RULES).forEach(id => {
  const field = document.getElementById(id);
  field.addEventListener("blur",  () => validateField(id));
  field.addEventListener("input", () => {
    if (field.classList.contains("bad")) validateField(id);   // clear as soon as fixed
    updateSubmitState();
  });
});

// ---------- live character counter ----------
const notes   = document.getElementById("notes");
const counter = document.getElementById("counter");
notes.addEventListener("input", () => {
  counter.textContent = `${notes.value.length} / 200`;
  counter.style.color = notes.value.length > 180 ? "#b00020" : "#5c3317";
});

// ---------- image preview + file validation on change ----------
const artifact = document.getElementById("artifact");
const preview  = document.getElementById("preview");
artifact.addEventListener("change", () => {
  if (!validateFile()) {
    preview.style.display = "none";
    updateSubmitState();
    return;
  }
  preview.src = URL.createObjectURL(artifact.files[0]);
  preview.style.display = "block";
  updateSubmitState();
});

// ---------- enable the submit button only when everything is valid ----------
function updateSubmitState() {
  const allText = Object.keys(RULES).every(id => {
    const f = document.getElementById(id);
    return !f.required || f.value.trim() !== "";
  });
  document.getElementById("submitBtn").disabled =
    !allText || artifact.files.length === 0;
}

// ---------- submit handler ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();                       // stop the default page reload

  // validate EVERY field, do not stop at the first failure
  const results = Object.keys(RULES).map(validateField);
  const fileOk  = validateFile();
  const valid   = results.every(Boolean) && fileOk;

  banner.style.display = "block";
  if (!valid) {
    const failed = results.filter(r => !r).length + (fileOk ? 0 : 1);
    banner.style.background = "#ffe5e5";
    banner.style.color      = "#b00020";
    banner.textContent      = `${failed} field(s) need attention. The values you typed were kept.`;
    // move focus to the first invalid control
    form.querySelector(".bad")?.focus();
    return;
  }

  banner.style.background = "#e6f4ea";
  banner.style.color      = "#1e6b33";
  banner.textContent      = "Validation passed. Queuing the manuscript for decoding...";

  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.artifact;                  // the binary is uploaded separately
  console.log("Validated payload:", payload);
});

updateSubmitState();
