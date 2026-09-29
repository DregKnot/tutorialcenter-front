const fs = require('fs');

function updateController(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const target = `            $orderString = implode(',', array_map('intval', $attempt->exam_year_ids));
            $questions = PastQuestion::whereIn('exam_year_id', $attempt->exam_year_ids)
                ->with([
                    'options:id,past_question_id,label,option_text',
                    'group',
                    'examYear.subject',
                ])
                ->orderByRaw("FIELD(exam_year_id, {$orderString}), question_number ASC, id ASC")
                ->get();`;

  const replacement = `            $questions = PastQuestion::whereIn('exam_year_id', $attempt->exam_year_ids)
                ->with([
                    'options:id,past_question_id,label,option_text',
                    'group',
                    'examYear.subject',
                ])
                ->orderBy('question_number', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->sortBy(function ($q) use ($attempt) {
                    $idx = array_search($q->exam_year_id, $attempt->exam_year_ids);
                    return $idx === false ? 9999 : $idx;
                })
                ->values();`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', filePath);
  } else {
    console.log('Target not found in:', filePath);
  }
}

updateController('C:/Users/Dreonite/tutorialcenter-back/app/Http/Controllers/StudentExamQuestionController.php');
updateController('C:/Users/Dreonite/tutorialcenter-back-live/tutorialcenter-back-live/app/Http/Controllers/StudentExamQuestionController.php');
