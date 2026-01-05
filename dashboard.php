<?php
session_start();
if (!isset($_SESSION["admin"])) {
    header("Location: admin.php");
    exit();
}
?>

<h2>Upload to Josh's Storyboard</h2>

<form action="upload.php" method="POST" enctype="multipart/form-data">
    <input type="file" name="photo" required><br>
    <textarea name="description" placeholder="Photo description" required></textarea><br>
    <button type="submit">Upload</button>
</form>

<a href="logout.php">Logout</a>
