<?php
session_start();

$_SESSION = [];                       // clear the in-memory data

// delete the session cookie from the browser as well
if (ini_get("session.use_cookies")) {
    $p = session_get_cookie_params();
    setcookie(session_name(), "", time() - 42000,
              $p["path"], $p["domain"], $p["secure"], $p["httponly"]);
}

session_destroy();                    // remove the file on the server

header("Location: login.php");
exit;
