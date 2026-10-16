<?php
require "db.php";

// FILTER_VALIDATE_INT rejects "1 OR 1=1" before it ever reaches the database
$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

if (!$id) {
    header("Location: index.php?msg=" . urlencode("Invalid id supplied."));
    exit;
}

// ---------- DELETE : prepared statement with a bound integer ----------
$stmt = $conn->prepare("DELETE FROM manuscripts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

$removed = $stmt->affected_rows;
$stmt->close();
$conn->close();

header("Location: index.php?msg=" .
       urlencode($removed > 0 ? "Record $id deleted."
                              : "No record with id $id was found."));
exit;
