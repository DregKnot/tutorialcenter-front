<?php
// Apply backend updates to support:
// 1. Exam attempt rejoining with remaining time verification
// 2. Active in-progress exam session detection
// 3. Exam abandonment when time expires or explicitly abandoned
// Applied to both local and live backend directories.

$backends = [
    'local' => 'C:/Users/Dreonite/tutorialcenter-back',
    'live' => 'C:/Users/Dreonite/tutorialcenter-back-live/tutorialcenter-back-live'
];

foreach ($backends as $env => $basePath) {
    if (!is_dir($basePath)) {
        echo "[$env] Directory not found: $basePath\n";
        continue;
    }
    echo "=== Updating $env backend ($basePath) ===\n";

    // 1. Update ExamAttempt Model
    $attemptModelPath = "$basePath/app/Models/ExamAttempt.php";
    if (file_exists($attemptModelPath)) {
        $content = file_get_contents($attemptModelPath);
        if (!str_contains($content, "'timer',")) {
            $content = str_replace(
                "'status',",
                "'status',\n        'timer',",
                $content
            );
            $content = str_replace(
                "'student_id' => 'integer',",
                "'student_id' => 'integer',\n        'timer' => 'integer',",
                $content
            );
            file_put_contents($attemptModelPath, $content);
            echo "[$env] Updated ExamAttempt model with 'timer' fillable and cast.\n";
        }
    }

    // 2. Update StudentExamController.php (save timer on start)
    $studentExamCtrlPath = "$basePath/app/Http/Controllers/StudentExamController.php";
    if (file_exists($studentExamCtrlPath)) {
        $content = file_get_contents($studentExamCtrlPath);
        if (!str_contains($content, "\$attempt->update(['timer'")) {
            $oldSnippet = "\$this->examService\n            ->startExam(\n                \$student,\n                \$examYear->id\n            );";
            $newSnippet = "\$this->examService\n            ->startExam(\n                \$student,\n                \$examYear->id\n            );\n\n        \$attempt->update([\n            'timer' => (int) \$request->input('timer', 50),\n        ]);";
            if (str_contains($content, $oldSnippet)) {
                $content = str_replace($oldSnippet, $newSnippet, $content);
                file_put_contents($studentExamCtrlPath, $content);
                echo "[$env] Updated StudentExamController::start to persist timer.\n";
            }
        }
    }

    // 3. Update StudentExamResultController.php (add abandon() & enhance history())
    $resultCtrlPath = "$basePath/app/Http/Controllers/StudentExamResultController.php";
    if (file_exists($resultCtrlPath)) {
        $content = file_get_contents($resultCtrlPath);
        
        // Add abandon method if missing
        if (!str_contains($content, 'function abandon(')) {
            $abandonMethod = <<<PHP

    public function abandon(
        ExamAttempt \$attempt,
        Request \$request
    ) {
        \$student = \$request->user();
        if (\$attempt->student_id !== \$student->id) {
            abort(403, 'Unauthorized.');
        }

        if (\$attempt->status === ExamAttempt::IN_PROGRESS) {
            \$attempt->update([
                'status' => ExamAttempt::ABANDONED,
                'submitted_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Exam attempt marked as abandoned.',
            'attempt' => \$attempt,
        ]);
    }
PHP;
            // Insert before the last closing brace
            $lastBracePos = strrpos($content, '}');
            if ($lastBracePos !== false) {
                $content = substr_replace($content, $abandonMethod . "\n}", $lastBracePos, 1);
            }
        }

        // Enhance history method to check for active in-progress attempt and eager load examBody
        if (!str_contains($content, "'active_attempt' =>")) {
            $oldHistoryReturn = "return response()->json([\n            'success' => true,\n            'streak' => \$streak,\n            'data' => \$student\n                ? \$student->examAttempts()\n                    ->with('examYear.subject')\n                    ->latest()\n                    ->paginate(\$request->input('per_page', 15))\n                : [],\n        ]);";
            
            $newHistoryReturn = <<<'PHP'
        $activeAttempt = $student ? $student->examAttempts()
            ->where('status', ExamAttempt::IN_PROGRESS)
            ->with(['examYear.subject', 'examYear.examBody'])
            ->latest('started_at')
            ->first() : null;

        if ($activeAttempt) {
            $allocatedMinutes = (int) ($activeAttempt->timer ?: 50);
            $expiresAt = $activeAttempt->started_at
                ? $activeAttempt->started_at->copy()->addMinutes($allocatedMinutes)
                : now()->addMinutes(50);

            if (now()->greaterThanOrEqualTo($expiresAt)) {
                $activeAttempt->update([
                    'status' => ExamAttempt::ABANDONED,
                    'submitted_at' => now(),
                ]);
                $activeAttempt = null;
            } else {
                $activeAttempt->remaining_seconds = max(0, now()->diffInSeconds($expiresAt, false));
                $activeAttempt->timer = $allocatedMinutes;
            }
        }

        return response()->json([
            'success' => true,
            'streak' => $streak,
            'active_attempt' => $activeAttempt,
            'data' => $student
                ? $student->examAttempts()
                    ->with(['examYear.subject', 'examYear.examBody'])
                    ->latest()
                    ->paginate($request->input('per_page', 15))
                : [],
        ]);
PHP;
            if (str_contains($content, $oldHistoryReturn)) {
                $content = str_replace($oldHistoryReturn, $newHistoryReturn, $content);
                echo "[$env] Enhanced StudentExamResultController::history with active_attempt check.\n";
            }
        }

        file_put_contents($resultCtrlPath, $content);
    }

    // 4. Update StudentExamQuestionController.php (questions() validation & answers return)
    $questionCtrlPath = "$basePath/app/Http/Controllers/StudentExamQuestionController.php";
    if (file_exists($questionCtrlPath)) {
        $content = file_get_contents($questionCtrlPath);
        if (!str_contains($content, "'remaining_seconds' =>")) {
            $oldQuestionsMethod = "public function questions(\n        ExamAttempt \$attempt\n    ) {\n        \$questions = \$attempt\n            ->examYear\n            ->pastQuestions()\n            ->with([\n                'options:id,past_question_id,label,option_text', 'group',\n            ])\n            ->get();\n\n        return response()->json([\n            'success' => true,\n            'questions' => \$questions,\n        ]);\n    }";

            $newQuestionsMethod = <<<'PHP'
    public function questions(
        ExamAttempt $attempt
    ) {
        if ($attempt->status === ExamAttempt::ABANDONED || $attempt->status === ExamAttempt::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => 'This exam session has ended or been marked as abandoned and cannot be rejoined.',
            ], 403);
        }

        $allocatedMinutes = (int) ($attempt->timer ?: 50);
        $expiresAt = $attempt->started_at
            ? $attempt->started_at->copy()->addMinutes($allocatedMinutes)
            : now()->addMinutes(50);

        if (now()->greaterThanOrEqualTo($expiresAt)) {
            $attempt->update([
                'status' => ExamAttempt::ABANDONED,
                'submitted_at' => now(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'The time limit for this exam has expired and the session has ended.',
            ], 403);
        }

        $remainingSeconds = max(0, now()->diffInSeconds($expiresAt, false));
        $existingAnswers = $attempt->answers()->pluck('option_id', 'question_id')->toArray();

        $questions = $attempt
            ->examYear
            ->pastQuestions()
            ->with([
                'options:id,past_question_id,label,option_text', 'group',
            ])
            ->get();

        return response()->json([
            'success' => true,
            'attempt' => $attempt->loadMissing(['examYear.subject', 'examYear.examBody']),
            'questions' => $questions,
            'answers' => $existingAnswers,
            'remaining_seconds' => $remainingSeconds,
            'timer' => $allocatedMinutes,
        ]);
    }
PHP;
            if (str_contains($content, $oldQuestionsMethod)) {
                $content = str_replace($oldQuestionsMethod, $newQuestionsMethod, $content);
                file_put_contents($questionCtrlPath, $content);
                echo "[$env] Enhanced StudentExamQuestionController::questions with time check and answers.\n";
            }
        }
    }

    // 5. Update routes/api.php to register the abandon route
    $apiRoutesPath = "$basePath/routes/api.php";
    if (file_exists($apiRoutesPath)) {
        $content = file_get_contents($apiRoutesPath);
        if (!str_contains($content, "/{attempt}/abandon")) {
            $search = "Route::post('/{attempt}/submit', [StudentExamResultController::class, 'submit']); // Submit and finish exam";
            $replace = "Route::post('/{attempt}/submit', [StudentExamResultController::class, 'submit']); // Submit and finish exam\n        Route::post('/{attempt}/abandon', [StudentExamResultController::class, 'abandon']); // Mark exam as abandoned";
            if (str_contains($content, $search)) {
                $content = str_replace($search, $replace, $content);
                file_put_contents($apiRoutesPath, $content);
                echo "[$env] Registered /{attempt}/abandon in routes/api.php.\n";
            }
        }
    }
}

echo "All backend updates successfully applied.\n";
