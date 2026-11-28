/* Regenerate static snapshots and 360-degree 3D turntable sprite sheets from medalScene.js.
 * node scripts/render-exam-medals.cjs [tier]
 * Uses the Puppeteer dependency already included in node_modules.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const folder = 'src/components/common/badges/examperformance';
const FRAMES = 120;
const MOBILE_SPEC = { cols: 12, rows: 10, frameSize: 220, quality: 0.88 };
const HD_SPEC = { cols: 10, rows: 6, framesPerSheet: 60, frameSize: 400, quality: 0.93 };

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
    const ext = path.extname(file).toLowerCase();
    const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'text/javascript';
    res.setHeader('Content-Type', mime);
    res.end(body);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH || puppeteer.executablePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    for (const tier of (process.argv[2] ? [process.argv[2]] : ['bronze', 'silver', 'gold', 'platinum', 'diamond'])) {
      const data = await page.evaluate(async ({ tier, folder, FRAMES, MOBILE_SPEC, HD_SPEC }) => {
        const THREE = await import('/node_modules/three/build/three.module.js');
        const { RoomEnvironment } = await import('/node_modules/three/examples/jsm/environments/RoomEnvironment.js');
        const { FINISHES, createMedalScene } = await import(`/${folder}/medalScene.js`);
        if (!FINISHES[tier]) throw new Error("Unknown medal tier");

        const logoSource = new Image();
        logoSource.src = '/src/assets/images/TC%201.webp';
        await logoSource.decode();

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(400, 400); renderer.setPixelRatio(1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
        const model = createMedalScene(THREE, RoomEnvironment, renderer, FINISHES[tier], { logoSource });
        // Warm up SwiftShader pipelines and yield a frame before snapshot/turntable capture.
        renderer.render(model.scene, model.camera);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        renderer.render(model.scene, model.camera);
        const snapshot = renderer.domElement.toDataURL('image/webp', 0.93).split(',')[1];
        let pulse = null;
        if (model.updateTrophyGlow) {
          model.updateTrophyGlow(1.6, true);
          renderer.render(model.scene, model.camera);
          pulse = renderer.domElement.toDataURL('image/webp', 0.93).split(',')[1];
        }

        const mobileSheet = document.createElement('canvas');
        mobileSheet.width = MOBILE_SPEC.cols * MOBILE_SPEC.frameSize;
        mobileSheet.height = MOBILE_SPEC.rows * MOBILE_SPEC.frameSize;
        const mobileCtx = mobileSheet.getContext('2d');

        const hdSheet1 = document.createElement('canvas');
        hdSheet1.width = HD_SPEC.cols * HD_SPEC.frameSize;
        hdSheet1.height = HD_SPEC.rows * HD_SPEC.frameSize;
        const hdCtx1 = hdSheet1.getContext('2d');

        const hdSheet2 = document.createElement('canvas');
        hdSheet2.width = HD_SPEC.cols * HD_SPEC.frameSize;
        hdSheet2.height = HD_SPEC.rows * HD_SPEC.frameSize;
        const hdCtx2 = hdSheet2.getContext('2d');

        // Render once at 400x400 per angle and write both HD sheets (120 frames across 2 sheets) and compact mobile sheet.
        renderer.setSize(HD_SPEC.frameSize, HD_SPEC.frameSize);
        const premium = ['gold', 'platinum', 'diamond'].includes(tier);
        for (let i = 0; i < FRAMES; i += 1) {
          const t = (i / FRAMES) * 5;
          const angle = (i / FRAMES) * Math.PI * 2;
          model.medal.rotation.set(0.24, -0.48 + angle, -0.12);
          model.medal.position.y = -0.14 + Math.sin(angle * 2) * 0.025;
          model.updateSparkles(t, premium);
          renderer.render(model.scene, model.camera);

          const mCol = i % MOBILE_SPEC.cols;
          const mRow = Math.floor(i / MOBILE_SPEC.cols);
          mobileCtx.drawImage(renderer.domElement, mCol * MOBILE_SPEC.frameSize, mRow * MOBILE_SPEC.frameSize, MOBILE_SPEC.frameSize, MOBILE_SPEC.frameSize);

          const sheetIndex = i < HD_SPEC.framesPerSheet ? i : i - HD_SPEC.framesPerSheet;
          const hCol = sheetIndex % HD_SPEC.cols;
          const hRow = Math.floor(sheetIndex / HD_SPEC.cols);
          const targetCtx = i < HD_SPEC.framesPerSheet ? hdCtx1 : hdCtx2;
          targetCtx.drawImage(renderer.domElement, hCol * HD_SPEC.frameSize, hRow * HD_SPEC.frameSize);
        }

        const spinMobile = mobileSheet.toDataURL('image/webp', MOBILE_SPEC.quality).split(',')[1];
        const spinHd1 = hdSheet1.toDataURL('image/webp', HD_SPEC.quality).split(',')[1];
        const spinHd2 = hdSheet2.toDataURL('image/webp', HD_SPEC.quality).split(',')[1];
        model.dispose(); renderer.dispose(); renderer.forceContextLoss();
        return { snapshot, pulse, spinMobile, spinHd1, spinHd2 };
      }, { tier, folder, FRAMES, MOBILE_SPEC, HD_SPEC });
      const tierDir = path.join(root, folder, 'tiers', tier);
      fs.mkdirSync(tierDir, { recursive: true });
      fs.writeFileSync(path.join(tierDir, `${tier}.webp`), Buffer.from(data.snapshot, 'base64'));
      if (data.pulse) fs.writeFileSync(path.join(tierDir, `${tier}-pulse.webp`), Buffer.from(data.pulse, 'base64'));
      fs.writeFileSync(path.join(tierDir, `${tier}-spin.webp`), Buffer.from(data.spinMobile, 'base64'));
      fs.writeFileSync(path.join(tierDir, `${tier}-spin-hd-1.webp`), Buffer.from(data.spinHd1, 'base64'));
      fs.writeFileSync(path.join(tierDir, `${tier}-spin-hd-2.webp`), Buffer.from(data.spinHd2, 'base64'));
      console.log(`Rendered ${tier}: snap ${(data.snapshot.length * 0.75 / 1024).toFixed(1)}KB, mobile ${(data.spinMobile.length * 0.75 / 1024).toFixed(1)}KB, hd1 ${(data.spinHd1.length * 0.75 / 1024).toFixed(1)}KB, hd2 ${(data.spinHd2.length * 0.75 / 1024).toFixed(1)}KB`);
    }
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
