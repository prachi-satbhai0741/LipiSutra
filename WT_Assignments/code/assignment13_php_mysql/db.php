<?php
$HOST = "localhost";
$USER = "root";
$PASS = "";
$NAME = "lipisutra";

$conn = new mysqli($HOST, $USER, $PASS, $NAME);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// utf8mb4 is required so Devanagari and Modi transcripts are stored correctly
$conn->set_charset("utf8mb4");
