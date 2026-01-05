<?php
// VISITOR COUNTER
$visitFile = "data/visits.json";
$visits = file_exists($visitFile) ? json_decode(file_get_contents($visitFile), true) : 0;
$visits++;
file_put_contents($visitFile, json_encode($visits));

// LOAD PHOTOS
$photos = file_exists("data/photos.json")
    ? json_decode(file_get_contents("data/photos.json"), true)
    : [];
?>

<!DOCTYPE html>
<html>
<head>
    <title>Josh's Storyboard</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<h1>Josh’s Storyboard</h1>
<p>👀 Total Visitors: <?= $visits ?></p>

<div class="gallery">
<?php foreach (array_reverse($photos) as $index => $photo): ?>
    <div class="card">
        <a href="view.php?id=<?= $index ?>">
            <img src="uploads/<?= htmlspecialchars($photo['image']) ?>">
        </a>
        <p><?= htmlspecialchars($photo['description']) ?></p>
        <small><?= $photo['datetime'] ?></small><br>
        <small>❤️ <?= $photo['views'] ?> views</small>
    </div>
<?php endforeach; ?>
</div>

<script src="js/main.js"></script>
</body>
</html>
