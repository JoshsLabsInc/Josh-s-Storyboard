<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($_POST["password"] === "admin123") {
        $_SESSION["admin"] = true;
        header("Location: dashboard.php");
        exit();
    }
}
?>

<form method="POST">
    <h2>Admin Login</h2>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Login</button>
</form>
