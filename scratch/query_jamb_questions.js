const { execSync } = require('child_process');

const phpCode = `
$res = \\App\\Models\\ExamYear::whereIn('id', [2, 6, 7, 8])->with('subject')->get()->map(function($y) {
    return [
        'id' => $y->id,
        'year' => $y->year,
        'subject' => $y->subject->name,
        'questions_count' => $y->pastQuestions()->count()
    ];
});
echo json_encode($res);
`;

const res = execSync(`php ..\\tutorialcenter-back\\artisan tinker --execute="${phpCode.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
console.log('Available JAMB exam years questions:', JSON.parse(res));
