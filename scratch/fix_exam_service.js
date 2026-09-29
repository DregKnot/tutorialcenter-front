const fs = require('fs');

function fix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace('namespace AppServices;', 'namespace App\\Services;');
  content = content.replace('use AppModelsExamAttempt;', 'use App\\Models\\ExamAttempt;');
  content = content.replace('use AppModelsExamAttemptAnswer;', 'use App\\Models\\ExamAttemptAnswer;');
  content = content.replace('use AppModelsPastQuestion;', 'use App\\Models\\PastQuestion;');
  content = content.replace('use AppModelsPastQuestionOption;', 'use App\\Models\\PastQuestionOption;');
  content = content.replace('use AppModelsStudent;', 'use App\\Models\\Student;');
  content = content.replace('use AppModelsStudentSubjectTrial;', 'use App\\Models\\StudentSubjectTrial;');
  content = content.replace('use IlluminateSupportFacadesDB;', 'use Illuminate\\Support\\Facades\\DB;');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', filePath);
}

fix('C:/Users/Dreonite/tutorialcenter-back/app/Services/ExamService.php');
fix('C:/Users/Dreonite/tutorialcenter-back-live/tutorialcenter-back-live/app/Services/ExamService.php');
