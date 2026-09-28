<?php

$paths = [
    'c:/Users/Dreonite/tutorialcenter-back',
    'c:/Users/Dreonite/tutorialcenter-back-live/tutorialcenter-back-live'
];

foreach ($paths as $base) {
    if (!is_dir($base)) continue;
    
    // 1. StudentExamResultController.php
    $resCtrl = $base . '/app/Http/Controllers/StudentExamResultController.php';
    if (file_exists($resCtrl)) {
        $c = file_get_contents($resCtrl);
        $c = str_replace(
            '$activeAttempt->remaining_seconds = max(0, now()->diffInSeconds($expiresAt, false));',
            '$activeAttempt->remaining_seconds = (int) max(0, round(now()->diffInSeconds($expiresAt, false)));',
            $c
        );
        file_put_contents($resCtrl, $c);
        echo "Updated $resCtrl\n";
    }

    // 2. StudentExamQuestionController.php
    $qCtrl = $base . '/app/Http/Controllers/StudentExamQuestionController.php';
    if (file_exists($qCtrl)) {
        $c = file_get_contents($qCtrl);
        $c = str_replace(
            '$remainingSeconds = max(0, now()->diffInSeconds($expiresAt, false));',
            '$remainingSeconds = (int) max(0, round(now()->diffInSeconds($expiresAt, false)));',
            $c
        );
        file_put_contents($qCtrl, $c);
        echo "Updated $qCtrl\n";
    }
}
