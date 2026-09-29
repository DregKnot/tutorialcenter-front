const fs = require('fs');
const path = require('path');

// 1. Update ExamAttempt.php
function updateExamAttempt(backendDir) {
  const filePath = path.join(backendDir, 'app/Models/ExamAttempt.php');
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes("'is_jamb'")) {
    code = code.replace(
      "'timer',",
      "'timer',\n        'is_jamb',\n        'exam_year_ids',\n        'subject_scores',\n        'jamb_score',"
    );
  }

  if (!code.includes("'is_jamb' => 'boolean'")) {
    code = code.replace(
      "'timer' => 'integer',",
      "'timer' => 'integer',\n        'is_jamb' => 'boolean',\n        'exam_year_ids' => 'array',\n        'subject_scores' => 'array',\n        'jamb_score' => 'integer',"
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Updated ExamAttempt.php in ${backendDir}`);
}

// 2. Update ExamService.php
function updateExamService(backendDir) {
  const filePath = path.join(backendDir, 'app/Services/ExamService.php');
  if (!fs.existsSync(filePath)) return;
  
  const content = `<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\PastQuestion;
use App\Models\PastQuestionOption;
use App\Models\Student;
use App\Models\StudentSubjectTrial;
use Illuminate\Support\Facades\DB;

class ExamService
{
    public function __construct(
        protected SubjectTrialService $subjectTrialService,
        protected ExamActivityService $examActivityService
    ) {}

    public function startExam(Student $student, $examYearId)
    {
        return DB::transaction(function () use (
            $student,
            $examYearId
        ) {
            if (! $student->canAccessExam($examYearId)) {
                abort(403, 'Not eligible');
            }

            Student::whereKey($student->id)->lockForUpdate()->firstOrFail();

            $existingAttempt = ExamAttempt::lockForUpdate()
                ->where('student_id', $student->id)
                ->where('exam_year_id', $examYearId)
                ->where('status', ExamAttempt::IN_PROGRESS)
                ->where('started_at', '>=', now()->subHours(2))
                ->first();

            if ($existingAttempt) {
                $this->subjectTrialService->recordStarted($existingAttempt);

                return $existingAttempt;
            }

            $questionsCount = PastQuestion::where('exam_year_id', $examYearId)->count();

            $attempt = ExamAttempt::create([
                'student_id' => $student->id,
                'exam_year_id' => $examYearId,
                'is_jamb' => false,
                'total_questions' => $questionsCount,
                'started_at' => now(),
                'status' => ExamAttempt::IN_PROGRESS,
            ]);

            $this->subjectTrialService->recordStarted($attempt);

            StudentNotificationService::exam($attempt, 'exam_started');

            return $attempt;
        });
    }

    public function startJambExam(Student $student, array $examYearIds, int $timer = 120)
    {
        return DB::transaction(function () use (
            $student,
            $examYearIds,
            $timer
        ) {
            foreach ($examYearIds as $yearId) {
                if (! $student->canAccessExam($yearId)) {
                    abort(403, "Not eligible for exam year {$yearId}");
                }
            }

            Student::whereKey($student->id)->lockForUpdate()->firstOrFail();

            $existingAttempt = ExamAttempt::lockForUpdate()
                ->where('student_id', $student->id)
                ->where('is_jamb', true)
                ->where('status', ExamAttempt::IN_PROGRESS)
                ->where('started_at', '>=', now()->subHours(3))
                ->first();

            if ($existingAttempt) {
                $this->subjectTrialService->recordStarted($existingAttempt);

                return $existingAttempt;
            }

            $questionsCount = PastQuestion::whereIn('exam_year_id', $examYearIds)->count();

            // Anchor foreign key exam_year_id to first subject (Slot 1: Use of English)
            $primaryExamYearId = $examYearIds[0];

            $attempt = ExamAttempt::create([
                'student_id' => $student->id,
                'exam_year_id' => $primaryExamYearId,
                'is_jamb' => true,
                'exam_year_ids' => array_values($examYearIds),
                'total_questions' => $questionsCount,
                'timer' => $timer,
                'started_at' => now(),
                'status' => ExamAttempt::IN_PROGRESS,
            ]);

            $this->subjectTrialService->recordStarted($attempt);

            StudentNotificationService::exam($attempt, 'exam_started');

            return $attempt;
        });
    }

    public function submitAnswer(
        ExamAttempt $attempt,
        PastQuestion $question,
        PastQuestionOption $option
    ) {
        if ($attempt->status !== ExamAttempt::IN_PROGRESS) {
            abort(403, 'Exam already completed');
        }

        $validExamYearIds = ($attempt->is_jamb && is_array($attempt->exam_year_ids))
            ? $attempt->exam_year_ids
            : [$attempt->exam_year_id];

        if (! in_array($question->exam_year_id, $validExamYearIds)) {
            abort(422, 'Invalid question for this exam session');
        }

        if ($option->past_question_id !== $question->id) {
            abort(422, 'Invalid option');
        }

        return ExamAttemptAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'past_question_id' => $question->id,
            ],
            [
                'past_question_option_id' => $option->id,
            ]
        );
    }

    public function finalizeAttempt(ExamAttempt $attempt)
    {
        return DB::transaction(function () use ($attempt) {
            $attempt = ExamAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            if ($attempt->status !== ExamAttempt::IN_PROGRESS) {
                return $attempt;
            }

            $answers = $attempt->answers()
                ->with('option:id,is_correct')
                ->get();

            if ($attempt->is_jamb && is_array($attempt->exam_year_ids) && count($attempt->exam_year_ids) > 0) {
                $questions = PastQuestion::whereIn('exam_year_id', $attempt->exam_year_ids)
                    ->with('examYear.subject')
                    ->get();

                $answersMap = $answers->keyBy('past_question_id');
                $grouped = $questions->groupBy('exam_year_id');

                $subjectScores = [];
                $totalJambScore = 0;
                $totalCorrect = 0;
                $totalWrong = 0;

                foreach ($attempt->exam_year_ids as $yearId) {
                    $subQuestions = $grouped->get($yearId, collect());
                    $firstQ = $subQuestions->first();
                    $subjectName = $firstQ?->examYear?->subject?->name ?? "Subject {$yearId}";
                    $subjectId = $firstQ?->examYear?->subject_id;
                    $subTotal = $subQuestions->count();

                    $subCorrect = 0;
                    $subWrong = 0;

                    foreach ($subQuestions as $q) {
                        $ans = $answersMap->get($q->id);
                        if ($ans) {
                            if ($ans->is_correct) {
                                $subCorrect++;
                            } else {
                                $subWrong++;
                            }
                        }
                    }

                    // Proportional scaling to 100 max
                    // For 40-question elective: (correct / 40) * 100 = correct * 2.5
                    // For 60-question English: (correct / 60) * 100
                    $scaledScore = $subTotal > 0 ? (int) round(($subCorrect / $subTotal) * 100) : 0;
                    $scaledScore = min(100, max(0, $scaledScore));

                    $subjectScores[$subjectName] = [
                        'exam_year_id' => $yearId,
                        'subject_id' => $subjectId,
                        'subject_name' => $subjectName,
                        'correct' => $subCorrect,
                        'wrong' => $subWrong,
                        'total_questions' => $subTotal,
                        'score' => $scaledScore,
                        'max_score' => 100,
                    ];

                    $totalJambScore += $scaledScore;
                    $totalCorrect += $subCorrect;
                    $totalWrong += $subWrong;
                }

                $totalQuestions = $attempt->total_questions > 0 ? $attempt->total_questions : $questions->count();
                $unanswered = max(0, $totalQuestions - ($totalCorrect + $totalWrong));
                $compositePercentage = round(($totalJambScore / 400) * 100, 2);

                $attempt->update([
                    'correct_answers' => $totalCorrect,
                    'wrong_answers' => $totalWrong,
                    'unanswered' => $unanswered,
                    'score' => $totalJambScore,
                    'jamb_score' => $totalJambScore,
                    'percentage' => $compositePercentage,
                    'subject_scores' => $subjectScores,
                    'submitted_at' => now(),
                    'status' => ExamAttempt::COMPLETED,
                ]);

            } else {
                // Standard Single-Subject Exam Finalization
                $correct = $answers
                    ->filter(fn ($answer) => $answer->is_correct)
                    ->count();

                $wrong = $answers
                    ->filter(fn ($answer) => ! $answer->is_correct)
                    ->count();

                $total = $attempt->total_questions;
                $unanswered = max(0, $total - ($correct + $wrong));
                $percentage = $total > 0 ? ($correct / $total) * 100 : 0;

                $attempt->update([
                    'correct_answers' => $correct,
                    'wrong_answers' => $wrong,
                    'unanswered' => $unanswered,
                    'score' => $correct,
                    'percentage' => round($percentage, 2),
                    'submitted_at' => now(),
                    'status' => ExamAttempt::COMPLETED,
                ]);
            }

            $this->subjectTrialService->recordEnded(
                $attempt,
                StudentSubjectTrial::COMPLETED
            );

            $this->examActivityService->endOpenSessionsForAttempt(
                $attempt,
                'submitted'
            );

            StudentNotificationService::exam($attempt, 'exam_completed');

            return $attempt;
        });
    }

    public function reviewAttempt(ExamAttempt $attempt)
    {
        return $attempt->answers()
            ->with([
                'question.options',
                'question.examYear.subject',
                'option',
            ])
            ->get()
            ->map(function ($answer) {
                $correctOption = $answer->question
                    ->options
                    ->firstWhere('is_correct', true);

                return [
                    'question_id' => $answer->question->id,
                    'question_number' => $answer->question->question_number,
                    'exam_year_id' => $answer->question->exam_year_id,
                    'subject_name' => $answer->question->examYear?->subject?->name ?? 'Subject',
                    'question' => $answer->question->question,
                    'explanation' => $answer->question->explanation,
                    'is_correct' => $answer->is_correct,
                    'student_answer' => [
                        'id' => $answer->option?->id,
                        'label' => $answer->option?->label,
                        'text' => $answer->option?->option_text,
                    ],
                    'correct_answer' => [
                        'id' => $correctOption?->id,
                        'label' => $correctOption?->label,
                        'text' => $correctOption?->option_text,
                    ],
                    'options' => $answer->question
                        ->options
                        ->map(function ($option) use ($answer) {
                            return [
                                'id' => $option->id,
                                'label' => $option->label,
                                'text' => $option->option_text,
                                'is_correct' => $option->is_correct,
                                'selected' => $option->id === $answer->past_question_option_id,
                            ];
                        }),
                ];
            });
    }
}
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ExamService.php in ${backendDir}`);
}

// 3. Update StudentExamController.php
function updateStudentExamController(backendDir) {
  const filePath = path.join(backendDir, 'app/Http/Controllers/StudentExamController.php');
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes('startJamb')) {
    const jambMethod = `
    public function startJamb(Request $request)
    {
        $request->validate([
            'exam_year_ids' => 'required|array|size:4',
            'exam_year_ids.*' => 'required|exists:exam_years,id',
            'timer' => 'nullable|integer|min:1',
        ]);

        $student = $request->user();
        $examYearIds = $request->input('exam_year_ids');
        $timer = (int) $request->input('timer', 120);

        $attempt = $this->examService->startJambExam($student, $examYearIds, $timer);

        $award = $this->onboardingAchievementService->firstPracticeStarted(
            $student,
            $attempt
        );

        if (! StudentNotificationService::enabled()) {
            StudentNotificationService::notify($student, 'Started JAMB Mock Exam', ["You have started a 4-subject JAMB practice session."]);
        }

        return response()->json([
            'success' => true,
            'attempt' => $attempt,
            'new_achievement' => $this->formatAchievement($award),
        ]);
    }
`;
    code = code.replace(/}\s*$/, `${jambMethod}\n}\n`);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Updated StudentExamController.php in ${backendDir}`);
  }
}

// 4. Update StudentExamQuestionController.php
function updateStudentExamQuestionController(backendDir) {
  const filePath = path.join(backendDir, 'app/Http/Controllers/StudentExamQuestionController.php');
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace questions method with multi-subject aware version
  const newQuestionsMethod = `    public function questions(
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

        $remainingSeconds = (int) max(0, round(now()->diffInSeconds($expiresAt, false)));
        $existingAnswers = [];
        try {
            $existingAnswers = $attempt->answers()
                ->pluck('past_question_option_id', 'past_question_id')
                ->toArray();
        } catch (\\Throwable $e) {
            \\Illuminate\\Support\Facades\\Log::warning('Could not pluck attempt answers: ' . $e->getMessage());
        }

        $subjects = [];
        if ($attempt->is_jamb && is_array($attempt->exam_year_ids) && count($attempt->exam_year_ids) > 0) {
            $orderString = implode(',', array_map('intval', $attempt->exam_year_ids));
            $questions = PastQuestion::whereIn('exam_year_id', $attempt->exam_year_ids)
                ->with([
                    'options:id,past_question_id,label,option_text',
                    'group',
                    'examYear.subject',
                ])
                ->orderByRaw("FIELD(exam_year_id, {$orderString}), question_number ASC, id ASC")
                ->get();

            $examYears = \\App\\Models\\ExamYear::whereIn('id', $attempt->exam_year_ids)
                ->with('subject')
                ->get()
                ->keyBy('id');

            $startIndex = 0;
            foreach ($attempt->exam_year_ids as $yearId) {
                $ey = $examYears->get($yearId);
                $subCount = $questions->where('exam_year_id', $yearId)->count();
                $subjects[] = [
                    'exam_year_id' => $yearId,
                    'subject_id' => $ey?->subject_id,
                    'name' => $ey?->subject?->name ?? "Subject {$yearId}",
                    'total_questions' => $subCount,
                    'start_index' => $startIndex,
                    'end_index' => max($startIndex, $startIndex + $subCount - 1),
                ];
                $startIndex += $subCount;
            }
        } else {
            $questions = $attempt
                ->examYear
                ->pastQuestions()
                ->with([
                    'options:id,past_question_id,label,option_text', 'group',
                ])
                ->get();
        }

        return response()->json([
            'success' => true,
            'is_jamb' => (bool) $attempt->is_jamb,
            'subjects' => $subjects,
            'subject_scores' => $attempt->subject_scores,
            'jamb_score' => $attempt->jamb_score,
            'attempt' => $attempt->loadMissing(['examYear.subject', 'examYear.examBody']),
            'questions' => $questions,
            'answers' => $existingAnswers,
            'remaining_seconds' => $remainingSeconds,
            'timer' => $allocatedMinutes,
        ]);
    }`;

  // Find public function questions and replace up to end of questions() method
  code = code.replace(/public function questions\([\s\S]*?return response\(\)->json\(\[\s*'success' => true,[\s\S]*?timer' => \$allocatedMinutes,\s*\]\);\s*}/, newQuestionsMethod);

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Updated StudentExamQuestionController.php in ${backendDir}`);
}

// 5. Update routes/api.php
function updateApiRoutes(backendDir) {
  const filePath = path.join(backendDir, 'routes/api.php');
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes('/start-jamb')) {
    code = code.replace(
      "Route::post('/start/{examYear}', [StudentExamController::class, 'start']);",
      "Route::post('/start-jamb', [StudentExamController::class, 'startJamb']);\n        Route::post('/start/{examYear}', [StudentExamController::class, 'start']);"
    );
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Updated routes/api.php in ${backendDir}`);
  }
}

// Run for both backend and backend-live
const backends = [
  path.resolve(__dirname, '../../tutorialcenter-back'),
  path.resolve(__dirname, '../../tutorialcenter-back-live/tutorialcenter-back-live'),
];

for (const dir of backends) {
  console.log(`Processing ${dir}...`);
  updateExamAttempt(dir);
  updateExamService(dir);
  updateStudentExamController(dir);
  updateStudentExamQuestionController(dir);
  updateApiRoutes(dir);
}
console.log('Backend update complete.');
