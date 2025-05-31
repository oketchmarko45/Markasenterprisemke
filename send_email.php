<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"]));
    $service = strip_tags(trim($_POST["service"]));

    // Validate data
    if (empty($name) || empty($service) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Please complete the form and try again.";
        exit;
    }

    // Set recipient email (change to yours)
    $recipient = "oketchmarko45@gmail.com";
    $subject = "New Service Booking from $name";

    // Build email content
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n\n";
    $email_content .= "Service Request:\n$service\n";

    // Build email headers
    $headers = "From: $name <$email>";

    // Send email
    if (mail($recipient, $subject, $email_content, $headers)) {
        // Redirect to thank you page
        header("Location: thankyou.html");
        exit;
    } else {
        http_response_code(500);
        echo "Oops! Something went wrong and we couldn't send your message.";
    }
} else {
    http_response_code(403);
    echo "There was a problem with your submission, please try again.";
}
?>
