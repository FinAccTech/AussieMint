<?php




// $host = "mail.xauag.au";
// $port = 465; // Change to 465 if using SSL

// $connection = fsockopen($host, $port, $errno, $errstr, 10);
// if (!$connection) {
//     echo "Failed to connect: $errstr ($errno)\n";
// } else {
//     echo "Connected successfully to SMTP server!";
//     fclose($connection);
// }


// ini_set("SMTP", "relay-hosting.secureserver.net");
// ini_set("smtp_port", "587");

// $to         = "finacctechnologies@gmail.com";
// $subject    = "Test Email";
// $message    = "Hello, this is a test email.";
// $headers    = "From: admin@xauag.au";

// if (mail($to, $subject, $message, $headers)) {
//     echo "Email sent successfully.";
// } else {
//     echo "Failed to send email.";
// }

// $to = "finacctechnologies@gmail.com";
// $subject = "Test Email from PHP";
// $message = "Hello, this is a test email.";
// $headers = "From: admin@xauag.au";

// if (mail($to, $subject, $message, $headers)) {
//     echo "Email sent successfully.";
// } else {
//     echo "Failed to send email.";    
// }

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    // Include PHPMailer files
    require 'PHPMailer-master/src/Exception.php';
    require 'PHPMailer-master/src/PHPMailer.php';
    require 'PHPMailer-master/src/SMTP.php';

    // Create an instance of PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'mail.xauag.au';  // Replace with your SMTP server
        $mail->SMTPAuth = true;
        $mail->Username = 'admin@xauag.au';  // Your email
        $mail->Password = 'Rajiv@2025';  // Your email password (Use App Password for Gmail)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 465;
    

        $mail->setFrom('admin@xauag.au', 'FinAcc Technologies');
        $mail->addAddress('lesunindia@gmail.com');

        $mail->Subject = 'Test Email';
        $mail->Body    = 'This is a test email sent using PHPMailer.';

        $mail->send();
        echo "Email sent successfully.";
    } catch (Exception $e) {
        echo "Email could not be sent. Error: {$mail->ErrorInfo}";
    }

?>
