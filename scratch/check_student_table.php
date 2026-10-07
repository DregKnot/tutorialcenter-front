<?php
$pdo = new PDO('sqlite:C:/Users/Dreonite/tutorialcenter-back/database/database.sqlite');
echo "=== STUDENTS TABLE COLUMNS ===\n";
$stmt = $pdo->query('PRAGMA table_info(students)');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $r['name'] . " (" . $r['type'] . ")\n";
}

echo "\n=== COURSES_ENROLLMENTS COLUMNS ===\n";
$stmt = $pdo->query('PRAGMA table_info(courses_enrollments)');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $r['name'] . " (" . $r['type'] . ")\n";
}

echo "\n=== PAYMENTS COLUMNS ===\n";
$stmt = $pdo->query('PRAGMA table_info(payments)');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $r['name'] . " (" . $r['type'] . ")\n";
}
