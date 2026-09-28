<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cols = Illuminate\Support\Facades\Schema::getColumnListing('exam_attempts');
echo "EXAM_ATTEMPTS COLUMNS:\n";
print_r($cols);

$latest = App\Models\ExamAttempt::latest()->first();
if ($latest) {
    echo "LATEST ATTEMPT:\n";
    print_r($latest->toArray());
}
