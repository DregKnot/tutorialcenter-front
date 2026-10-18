const fs = require('fs');
const file = 'c:/Users/Dreonite/tutorialcenter-back/config/cors.php';
let content = fs.readFileSync(file, 'utf8');

const oldAllowed = `'allowed_origins' => ['http://localhost:3000', 'https://tutorialcenter-rho.vercel.app', 'https://tutorialcenter.africa', 'https://affiliates.tutorialcenter.africa', 'https://www.tutorialcenter.africa'],`;

const newAllowed = `'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'https://tutorialcenter-rho.vercel.app',
        'https://tutorialcenter.africa',
        'https://affiliates.tutorialcenter.africa',
        'https://www.tutorialcenter.africa'
    ],

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\\\\.0\\\\.0\\\\.1)(:\\\\d+)?$#'
    ],`;

// Normalize \r\n to \n
content = content.replace(/\r\n/g, '\n');

if (content.includes(oldAllowed)) {
  content = content.replace(
    oldAllowed + "\n\n    'allowed_origins_patterns' => [],",
    newAllowed
  );
  fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
  console.log('SUCCESSFULLY_UPDATED_CORS');
} else {
  console.log('TARGET_NOT_FOUND');
}
