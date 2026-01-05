<?php
session_start();
if (!isset($_SESSION["admin"])) exit();

$uploadsDir = "uploads/";
$dataFile = "data/photos.json";

$imageName = time() . "_" . $_FILES["photo"]["name"];
$target = $uploadsDir . $imageName;

move_uploaded_file($_FILES["photo"]["tmp_name"], $target);

$photos = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

$photos[] = [
    "image" => $imageName,
    "description" => $_POST["description"],
    "datetime" => date("Y-m-d H:i:s"),
    "views" => 0
];

file_put_contents($dataFile, json_encode($photos, JSON_PRETTY_PRINT));

header("Location: dashboard.php");
