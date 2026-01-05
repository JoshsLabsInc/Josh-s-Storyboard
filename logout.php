<?php
session_start();

/* Unset all session variables */
$_SESSION = [];

/* Destroy the session */
session_destroy();

/* Redirect back to admin login */
header("Location: admin.php");
exit();
