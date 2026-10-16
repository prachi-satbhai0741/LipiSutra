<?php
session_start();

// ---------- SESSION GUARD : only a signed-in user may open this page ----------
if (!isset($_SESSION["username"])) {
    header("Location: login.php");
    exit;
}

$errors = [];
$report = null;

// ---------- FORM HANDLING ----------
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // sanitize : trim and escape every incoming value
    function clean($value) {
        return htmlspecialchars(stripslashes(trim($value)), ENT_QUOTES, "UTF-8");
    }

    $title     = clean($_POST["title"]     ?? "");
    $accession = clean($_POST["accession"] ?? "");
    $email     = clean($_POST["email"]     ?? "");
    $year      = clean($_POST["year"]      ?? "");
    $script    = clean($_POST["script"]    ?? "");
    $transcript= clean($_POST["transcript"]?? "");

    // ---------- VALIDATION ----------
    if ($title === "") {
        $errors["title"] = "Title is required.";
    } elseif (mb_strlen($title) < 5 || mb_strlen($title) > 80) {
        $errors["title"] = "Title must be between 5 and 80 characters.";
    }

    if (!preg_match('/^LS-\d{4}$/', $accession)) {
        $errors["accession"] = "Accession number must look like LS-0147.";
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors["email"] = "Enter a valid email address.";
    }

    $yearCheck = filter_var($year, FILTER_VALIDATE_INT,
                            ["options" => ["min_range" => -500, "max_range" => 2026]]);
    if ($yearCheck === false) {
        $errors["year"] = "Year must be a whole number between -500 and 2026.";
    }

    $allowed = ["Modi", "Devanagari", "Brahmi", "Sharada"];
    if (!in_array($script, $allowed, true)) {
        $errors["script"] = "Choose one of the supported scripts.";
    }

    if (str_word_count($transcript) < 5) {
        $errors["transcript"] = "The transcript must contain at least 5 words.";
    }

    // ---------- STRING MANIPULATION on the accepted data ----------
    if (empty($errors)) {
        $_SESSION["submitted"] = ($_SESSION["submitted"] ?? 0) + 1;

        $slug = strtolower(str_replace(" ", "-", $title));          // str_replace + strtolower
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

        $words   = str_word_count($transcript);                     // word count
        $chars   = mb_strlen($transcript);                          // multibyte-safe length
        $preview = mb_substr($transcript, 0, 60);                   // substring
        if ($chars > 60) { $preview .= "..."; }

        $tokens  = explode(" ", $transcript);                       // string -> array
        $first5  = implode(" ", array_slice($tokens, 0, 5));        // array -> string

        $era = ($yearCheck < 0) ? abs($yearCheck) . " BCE" : $yearCheck . " CE";

        $report = [
            "Normalised title"   => ucwords(strtolower($title)),    // ucwords
            "URL slug"           => $slug,
            "Accession (upper)"  => strtoupper($accession),         // strtoupper
            "Submitted by"       => $_SESSION["fullname"] . " (" . $_SESSION["role"] . ")",
            "Email domain"       => substr($email, strpos($email, "@") + 1),  // strpos+substr
            "Script"             => $script,
            "Era"                => $era,
            "Transcript words"   => $words,
            "Transcript chars"   => $chars,
            "First five words"   => $first5,
            "Preview"            => $preview,
            "Reversed accession" => strrev($accession),             // strrev
            "Submission number"  => $_SESSION["submitted"] . " this session"
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>LipiSutra - Submit Manuscript</title>
<style>
  body  { font-family:Georgia,serif; background:#f5ede0; color:#1a0800; padding:24px; }
  .err  { color:#b00020; font-size:13px; }
  table { border-collapse:collapse; margin-top:16px; }
  td,th { border:1px solid #8B4513; padding:6px 12px; font-size:14px; text-align:left; }
  input,select,textarea { padding:6px; width:320px; }
</style></head>
<body>

  <!-- ---------- SESSION DATA READ BACK ---------- -->
  <p>
    Signed in as <b><?= htmlspecialchars($_SESSION["fullname"]) ?></b>
    (<?= htmlspecialchars($_SESSION["role"]) ?>) since
    <?= htmlspecialchars($_SESSION["login_at"]) ?>.
    &nbsp;<a href="logout.php">Sign out</a>
  </p>

  <h1>Submit a Manuscript</h1>

  <form method="post" action="<?= htmlspecialchars($_SERVER["PHP_SELF"]) ?>">

    <label>Title</label><br>
    <!-- STICKY FORM : the typed value survives a failed submit -->
    <input type="text" name="title"
           value="<?= htmlspecialchars($_POST["title"] ?? "") ?>">
    <span class="err"><?= $errors["title"] ?? "" ?></span><br><br>

    <label>Accession Number</label><br>
    <input type="text" name="accession" placeholder="LS-0147"
           value="<?= htmlspecialchars($_POST["accession"] ?? "") ?>">
    <span class="err"><?= $errors["accession"] ?? "" ?></span><br><br>

    <label>Email</label><br>
    <input type="text" name="email"
           value="<?= htmlspecialchars($_POST["email"] ?? "") ?>">
    <span class="err"><?= $errors["email"] ?? "" ?></span><br><br>

    <label>Estimated Year (negative for BCE)</label><br>
    <input type="text" name="year"
           value="<?= htmlspecialchars($_POST["year"] ?? "") ?>">
    <span class="err"><?= $errors["year"] ?? "" ?></span><br><br>

    <label>Script</label><br>
    <select name="script">
      <option value="">-- select --</option>
      <?php foreach (["Modi","Devanagari","Brahmi","Sharada"] as $s): ?>
        <option <?= (($_POST["script"] ?? "") === $s) ? "selected" : "" ?>><?= $s ?></option>
      <?php endforeach; ?>
    </select>
    <span class="err"><?= $errors["script"] ?? "" ?></span><br><br>

    <label>Transcript</label><br>
    <textarea name="transcript" rows="4"><?= htmlspecialchars($_POST["transcript"] ?? "") ?></textarea>
    <span class="err"><?= $errors["transcript"] ?? "" ?></span><br><br>

    <button type="submit">Submit</button>
  </form>

  <?php if ($report !== null): ?>
    <h2>Accepted - Derived Report</h2>
    <table>
      <?php foreach ($report as $key => $value): ?>
        <tr><th><?= htmlspecialchars($key) ?></th>
            <td><?= htmlspecialchars((string)$value) ?></td></tr>
      <?php endforeach; ?>
    </table>
  <?php elseif (!empty($errors)): ?>
    <p class="err"><?= count($errors) ?> field(s) need attention.
       Your entries have been preserved.</p>
  <?php endif; ?>

</body>
</html>
