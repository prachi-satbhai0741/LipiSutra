<?php
require "db.php";

$search = trim($_GET["q"] ?? "");

if ($search !== "") {
    // READ with a filter - still a prepared statement
    $stmt = $conn->prepare(
        "SELECT * FROM manuscripts
          WHERE title LIKE ? OR accession LIKE ? OR script LIKE ?
          ORDER BY created_at DESC"
    );
    $like = "%" . $search . "%";
    $stmt->bind_param("sss", $like, $like, $like);
} else {
    $stmt = $conn->prepare("SELECT * FROM manuscripts ORDER BY created_at DESC");
}

$stmt->execute();
$result = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>LipiSutra Archive</title>
<style>
  body  { font-family:Georgia,serif; background:#f5ede0; color:#1a0800; padding:24px; }
  table { border-collapse:collapse; width:100%; background:#fff; }
  th,td { border:1px solid #8B4513; padding:8px; font-size:14px; text-align:left; }
  th    { background:#ede0cc; }
  .ok   { color:#1e6b33; font-weight:bold; }
  .pend { color:#a15c00; font-weight:bold; }
  a.btn { padding:4px 10px; border:1px solid #8B4513; border-radius:4px;
          text-decoration:none; color:#6B2D0E; font-size:13px; }
</style></head>
<body>

  <h1>LipiSutra Manuscript Archive</h1>

  <?php if (isset($_GET["msg"])): ?>
    <p class="ok"><?= htmlspecialchars($_GET["msg"]) ?></p>
  <?php endif; ?>

  <form method="get">
    <input type="text" name="q" placeholder="Search title, accession or script"
           value="<?= htmlspecialchars($search) ?>" size="40">
    <button type="submit">Search</button>
    <a class="btn" href="index.php">Reset</a>
    <a class="btn" href="create.php">+ Add Manuscript</a>
  </form>

  <p><?= $result->num_rows ?> record(s) found.</p>

  <table>
    <tr>
      <th>ID</th><th>Accession</th><th>Title</th><th>Script</th>
      <th>Year</th><th>Confidence</th><th>Status</th><th>Actions</th>
    </tr>

    <?php if ($result->num_rows === 0): ?>
      <tr><td colspan="8">No manuscripts match the search.</td></tr>
    <?php endif; ?>

    <?php while ($row = $result->fetch_assoc()): ?>
      <tr>
        <td><?= (int)$row["id"] ?></td>
        <td><?= htmlspecialchars($row["accession"]) ?></td>
        <td><?= htmlspecialchars($row["title"]) ?></td>
        <td><?= htmlspecialchars($row["script"]) ?></td>
        <td><?= $row["era_year"] < 0
                 ? abs($row["era_year"]) . " BCE"
                 : $row["era_year"] . " CE" ?></td>
        <td><?= number_format($row["confidence"], 2) ?>%</td>
        <td class="<?= $row["status"] === "verified" ? "ok" : "pend" ?>">
          <?= htmlspecialchars($row["status"]) ?>
        </td>
        <td>
          <a class="btn" href="update.php?id=<?= (int)$row["id"] ?>">Edit</a>
          <a class="btn" href="delete.php?id=<?= (int)$row["id"] ?>"
             onclick="return confirm('Delete <?= htmlspecialchars($row["accession"]) ?>?');">
             Delete</a>
        </td>
      </tr>
    <?php endwhile; ?>
  </table>

<?php
$stmt->close();
$conn->close();
?>
</body>
</html>
