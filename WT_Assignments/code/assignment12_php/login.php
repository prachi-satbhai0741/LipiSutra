<?php
session_start();                                  // must precede any output

// a tiny demonstration user table; a real system reads a database
$USERS = [
    "prachi"  => ["pass" => "Lipi@2026", "name" => "Prachi Satbhai", "role" => "Historian"],
    "curator" => ["pass" => "Museum@26", "name" => "A. Curator",     "role" => "Museum Admin"]
];

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = trim($_POST["username"] ?? "");
    $pass = $_POST["password"] ?? "";

    if ($user === "" || $pass === "") {
        $error = "Both username and password are required.";
    } elseif (!isset($USERS[$user]) || $USERS[$user]["pass"] !== $pass) {
        $error = "Invalid credentials.";
    } else {
        session_regenerate_id(true);              // prevent session fixation

        $_SESSION["username"]  = $user;
        $_SESSION["fullname"]  = $USERS[$user]["name"];
        $_SESSION["role"]      = $USERS[$user]["role"];
        $_SESSION["login_at"]  = date("d-m-Y H:i:s");
        $_SESSION["submitted"] = 0;               // a per-session counter

        header("Location: submit.php");           // Post / Redirect / Get
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>LipiSutra - Sign In</title></head>
<body style="font-family:Georgia,serif;background:#f5ede0;padding:24px">

  <h1>LipiSutra - Historian Sign In</h1>

  <?php if ($error !== ""): ?>
    <p style="color:#b00020"><?= htmlspecialchars($error) ?></p>
  <?php endif; ?>

  <form method="post" action="<?= htmlspecialchars($_SERVER["PHP_SELF"]) ?>">
    <label>Username</label><br>
    <input type="text" name="username"
           value="<?= htmlspecialchars($_POST["username"] ?? "") ?>"><br><br>

    <label>Password</label><br>
    <input type="password" name="password"><br><br>

    <button type="submit">Sign In</button>
  </form>

  <p style="font-size:13px;color:#5c3317">
    Demo accounts: prachi / Lipi@2026 &nbsp;|&nbsp; curator / Museum@26
  </p>
</body>
</html>
