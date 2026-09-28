<?php
// Script to apply schema updates and verify in-progress/abandoned exam handling
$paths = [
    'local' => 'C:/Users/Dreonite/tutorialcenter-back',
    'live' => 'C:/Users/Dreonite/tutorialcenter-back-live/tutorialcenter-back-live'
];

foreach ($paths as $env => $basePath) {
    if (!is_dir($basePath)) {
        echo "Skipping $env: directory not found at $basePath\n";
        continue;
    }
    echo "=== Updating $env backend ($basePath) ===\n";
    require_once "$basePath/vendor/autoload.php";
    $app = require "$basePath/bootstrap/app.php";
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    // 1. Add timer column to exam_attempts if missing
    if (!Illuminate\Support\Facades\Schema::hasColumn('exam_attempts', 'timer')) {
        Illuminate\Support\Facades\Schema::table('exam_attempts', function ($table) {
            $table->integer('timer')->nullable()->default(50)->after('status');
        });
        echo "Added 'timer' column to exam_attempts table in $env.\n";
    } else {
        echo "'timer' column already exists in exam_attempts in $env.\n";
    }
}
echo "Schema update completed.\n";
