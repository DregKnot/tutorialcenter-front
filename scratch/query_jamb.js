const { execSync } = require('child_process');

const phpCode = `
$years = \\App\\Models\\ExamYear::whereHas('examBody', function($q) {
    $q->where('slug', 'like', '%jamb%');
})->with('subject')->get()->map(function($y) {
    return [
        'id' => $y->id,
        'year' => $y->year,
        'subject' => $y->subject ? $y->subject->name : null,
        'subject_id' => $y->subject_id
    ];
});
echo json_encode($years);
`;

const res = execSync(`php ..\\tutorialcenter-back\\artisan tinker --execute="${phpCode.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
const list = JSON.parse(res);
const subjects = {};
list.forEach(item => {
  if (!subjects[item.subject]) subjects[item.subject] = [];
  subjects[item.subject].push(item.year);
});
console.log('Distinct JAMB Subjects & Year counts:', Object.keys(subjects).map(s => ({ subject: s, years: subjects[s].length })));
