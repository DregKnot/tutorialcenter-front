<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if (!Illuminate\Support\Facades\Schema::hasColumn('exam_attempts', 'timer')) {
    Illuminate\Support\Facades\Schema::table('exam_attempts', function ($table) {
        $table->integer('timer')->nullable()->default(50)->after('status');
    });
    echo "Added timer to live.\n";
} else {
    echo "Timer already exists in live.\n";
}
