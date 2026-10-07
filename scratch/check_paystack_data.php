<?php
$pdo = new PDO('sqlite:C:/Users/Dreonite/tutorialcenter-back/database/database.sqlite');
echo "=== PAYMENTS SUMMARY ===\n";
$stmt = $pdo->query('SELECT id, student_id, course_enrollment_id, amount, payment_method, gateway, gateway_reference, status, created_at FROM payments ORDER BY id DESC LIMIT 20');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($r) . "\n";
}

echo "\n=== COURSES_ENROLLMENTS SUMMARY ===\n";
$stmt = $pdo->query('SELECT id, student_id, course_id, status, enrollment_code, expires_at, paid_at, created_at FROM courses_enrollments ORDER BY id DESC LIMIT 20');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($r) . "\n";
}
