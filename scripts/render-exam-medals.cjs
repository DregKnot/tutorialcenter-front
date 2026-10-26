/* Regenerate the static WebGL fallbacks from the same scene used by the app.
 * CHROMIUM_PATH=/path/to/chromium node scripts/render-exam-medals.cjs
 * Uses the Puppeteer dependency already included through react-snap.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const folder = 'src/components/common/badges/examperformance';
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js"}}</script>');
    return;
  }
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', 'text/javascript'); res.end(body);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    for (const tier of (process.argv[2] ? [process.argv[2]] : ['bronze', 'silver', 'gold', 'platinum', 'diamond'])) {
      const data = await page.evaluate(async ({ tier, folder }) => {
        const THREE = await import('/node_modules/three/build/three.module.js');
        const { RoomEnvironment } = await import('/node_modules/three/examples/jsm/environments/RoomEnvironment.js');
        const { FINISHES, createMedalScene } = await import(`/${folder}/medalScene.js`);
        if (!FINISHES[tier]) throw new Error("Unknown medal tier");
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(640, 640); renderer.setPixelRatio(1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
        const model = createMedalScene(THREE, RoomEnvironment, renderer, FINISHES[tier]);
        renderer.render(model.scene, model.camera);
        const result = renderer.domElement.toDataURL('image/png').split(',')[1];
        model.dispose(); renderer.dispose(); renderer.forceContextLoss();
        return result;
      }, { tier, folder });
      fs.writeFileSync(path.join(root, folder, 'renders', `${tier}.png`), Buffer.from(data, 'base64'));
      console.log(`Rendered ${tier}`);
    }
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
