<?php
$id = $_GET["id"];
$file = "data/photos.json";
$data = json_decode(file_get_contents($file), true);

$data[$id]["views"]++;
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

header("Location: index.php");
