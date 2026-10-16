<?php
require "db.php";

$errors = [];

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $accession  = trim($_POST["accession"]  ?? "");
    $title      = trim($_POST["title"]      ?? "");
    $script     = trim($_POST["script"]     ?? "");
    $era_year   = trim($_POST["era_year"]   ?? "");
    $confidence = trim($_POST["confidence"] ?? "");
    $transcript = trim($_POST["transcript"] ?? "");

    // ---------- server-side validation ----------
    if (!preg_match('/^LS-\d{4}$/', $accession))      $errors[] = "Accession must be LS-0147.";
    if (mb_strlen($title) < 5)                         $errors[] = "Title is too short.";
    if (!in_array($script, ["Modi","Devanagari","Brahmi","Sharada"], true))
                                                       $errors[] = "Choose a valid script.";
    if (filter_var($era_year, FILTER_VALIDATE_INT,
        ["options" => ["min_range" => -500, "max_range" => 2026]]) === false)
                                                       $errors[] = "Year must be -500..2026.";
    if (!is_numeric($confidence) || $confidence < 0 || $confidence > 100)
                                                       $errors[] = "Confidence must be 0..100.";

    if (empty($errors)) {
        // ---------- CREATE : prepared INSERT ----------
        $stmt = $conn->prepare(
            "INSERT INTO manuscripts
               (accession, title, script, era_year, confidence, transcript)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        // s=string  i=integer  d=double
        $stmt->bind_param("sssids", $accession, $title, $script,
                                    $era_year, $confidence, $transcript);

        if ($stmt->execute()) {
            $newId = $conn->insert_id;
            $stmt->close();
            $conn->close();
            header("Location: index.php?msg=" .
                   urlencode("Manuscript created with id $newId."));
            exit;
        }

        $errors[] = ($conn->errno === 1062)
            ? "That accession number already exists."
            : "Insert failed: " . $stmt->error;
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Add Manuscript</title></head>
<body style="font-family:Georgia,serif;background:#f5ede0;padding:24px">

  <h1>Add a Manuscript</h1>
  <?php foreach ($errors as $e): ?>
    <p style="color:#b00020"><?= htmlspecialchars($e) ?></p>
  <?php endforeach; ?>

  <form method="post">
    Accession <input name="accession" placeholder="LS-0147"
                     value="<?= htmlspecialchars($_POST["accession"] ?? "") ?>"><br><br>
    Title     <input name="title" size="40"
                     value="<?= htmlspecialchars($_POST["title"] ?? "") ?>"><br><br>
    Script
    <select name="script">
      <?php foreach (["Modi","Devanagari","Brahmi","Sharada"] as $s): ?>
        <option <?= (($_POST["script"] ?? "") === $s) ? "selected" : "" ?>><?= $s ?></option>
      <?php endforeach; ?>
    </select><br><br>
    Year       <input name="era_year" value="<?= htmlspecialchars($_POST["era_year"] ?? "") ?>"><br><br>
    Confidence <input name="confidence" value="<?= htmlspecialchars($_POST["confidence"] ?? "") ?>"><br><br>
    Transcript <textarea name="transcript" rows="4" cols="50"><?=
                 htmlspecialchars($_POST["transcript"] ?? "") ?></textarea><br><br>

    <button type="submit">Save</button>
    <a href="index.php">Cancel</a>
  </form>
</body></html>
