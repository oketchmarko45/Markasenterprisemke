<?php
header('Content-Type: text/html; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars($_POST['phone']);
    $service = htmlspecialchars($_POST['service']);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

    // Send email
    $to = "oketchmarko45@gmail.com";
    $subject = "New Booking Request from $name";
    $message = "Name: $name\nEmail: $email\nPhone: $phone\nService: $service";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        header("Location: thankyou.html");
        exit();
    } else {
        echo "<script>alert('Failed to send email. Please try again later.'); window.history.back();</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>
