const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf-8');

const lines = code.split('\n');
const lazyImports = [];
const nonLazyImports = [];
let lastImportLineIndex = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('import ')) {
        lastImportLineIndex = i;
        const match = line.match(/import\s+(?:\{?\s*([^}]+?)\s*\}?)\s+from\s+["']([^"']+)["']/);
        if (match) {
            let names = match[1].split(',').map(n => n.trim());
            const source = match[2];
            
            if (source.startsWith('./pages') || source.startsWith('./components')) {
                // Ignore StickyButtons and ProtectedRoute
                if (names.includes('StickyButtons') || names.includes('ProtectedRoute') || source.includes('StaffAuthContext') || names.includes('Home')) {
                    nonLazyImports.push(line);
                } else {
                    names.forEach(name => {
                        if (line.includes('{')) {
                            lazyImports.push(`const ${name} = lazy(() => import("${source}").then(module => ({ default: module.${name} })));`);
                        } else {
                            lazyImports.push(`const ${name} = lazy(() => import("${source}"));`);
                        }
                    });
                }
            } else {
                nonLazyImports.push(line);
            }
        } else {
            nonLazyImports.push(line);
        }
    }
}

let newImports = `import React, { Suspense, lazy } from 'react';\nimport SplashScreen from "./components/public/SplashScreen.jsx";\n` + nonLazyImports.join('\n') + '\n\n// Lazy loaded components\n' + lazyImports.join('\n');

let restOfCode = lines.slice(lastImportLineIndex + 1).join('\n');

restOfCode = restOfCode.replace('<Routes>', '<Suspense fallback={<SplashScreen />}>\n      <Routes>');
restOfCode = restOfCode.replace('</Routes>', '</Routes>\n      </Suspense>');

fs.writeFileSync(appPath, newImports + restOfCode);
console.log('App.js updated successfully!');
