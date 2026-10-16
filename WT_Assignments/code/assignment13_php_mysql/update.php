<?php
require "db.php";

$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT)
   ?: filter_input(INPUT_POST, "id", FILTER_VALIDATE_INT);

if (!$id) { header("Location: index.php?msg=" . urlencode("Invalid id.")); exit; }

$errors = [];

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $title      = trim($_POST["title"]      ?? "");
    $script     = trim($_POST["script"]     ?? "");
    $era_year   = trim($_POST["era_year"]   ?? "");
    $confidence = trim($_POST["confidence"] ?? "");
    $status     = trim($_POST["status"]     ?? "");
    $transcript = trim($_POST["transcript"] ?? "");

    if (mb_strlen($title) < 5) $errors[] = "Title is too short.";
    if (!in_array($status, ["pending","verified"], true)) $errors[] = "Invalid status.";

    if (empty($errors)) {
        // ---------- UPDATE : prepared statement with a WHERE clause ----------
        $stmt = $conn->prepare(
            "UPDATE manuscripts
                SET title = ?, script = ?, era_year = ?, confidence = ?,
                    status = ?, transcript = ?
              WHERE id = ?"
        );
        $stmt->bind_param("ssidssi", $title, $script, $era_year,
                                     $confidence, $status, $transcript, $id);
        $stmt->execute();
        $changed = $stmt->affected_rows;      // 0 if nothing actually differed
        $stmt->close();
        $conn->close();

        header("Location: index.php?msg=" .
               urlencode($changed > 0 ? "Record $id updated."
                                      : "No change was needed for record $id."));
        exit;
    }
}

// ---------- READ the current row to pre-fill the form ----------
$stmt = $conn->prepare("SELECT * FROM manuscripts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) { header("Location: index.php?msg=" . urlencode("Record not found.")); exit; }
?>
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Edit Manuscript</title></head>
<body style="font-family:Georgia,serif;background:#f5ede0;padding:24px">

  <h1>Edit <?= htmlspecialchars($row["accession"]) ?></h1>
  <?php foreach ($errors as $e): ?>
    <p style="color:#b00020"><?= htmlspecialchars($e) ?></p>
  <?php endforeach; ?>

  <form method="post">
    <input type="hidden" name="id" value="<?= (int)$row["id"] ?>">

    Title <input name="title" size="40"
                 value="<?= htmlspecialchars($row["title"]) ?>"><br><br>
    Script
    <select name="script">
      <?php foreach (["Modi","Devanagari","Brahmi","Sharada"] as $s): ?>
        <option <?= $row["script"] === $s ? "selected" : "" ?>><?= $s ?></option>
      <?php endforeach; ?>
    </select><br><br>
    Year       <input name="era_year"   value="<?= (int)$row["era_year"] ?>"><br><br>
    Confidence <input name="confidence" value="<?= htmlspecialchars($row["confidence"]) ?>"><br><br>
    Status
    <select name="status">
      <option <?= $row["status"] === "pending"  ? "selected" : "" ?>>pending</option>
      <option <?= $row["status"] === "verified" ? "selected" : "" ?>>verified</option>
    </select><br><br>
    Transcript <textarea name="transcript" rows="4" cols="50"><?=
                 htmlspecialchars($row["transcript"]) ?></textarea><br><br>

    <button type="submit">Update</button>
    <a href="index.php">Cancel</a>
  </form>
</body></html>
