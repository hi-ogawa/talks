import { readdirSync, cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Get all talk directories (directories with package.json that have a build script)
const talks = readdirSync('.', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .filter(dirent => /^\d{4}-\d{2}-\d{2}$/.test(dirent.name))
  .map(dirent => dirent.name)
  .sort();

console.log('Found talks:', talks);

// Clean and create dist directory
if (existsSync('dist')) {
  cpSync('dist', 'dist-backup', { recursive: true, force: true });
  console.log('Backed up existing dist directory');
}
mkdirSync('dist', { recursive: true });

// Build each talk and copy to dist
for (const talk of talks) {
  console.log(`\nBuilding ${talk}...`);
  const talkDir = join(process.cwd(), talk);
  
  try {
    // Run the build in the talk directory
    execSync('pnpm build', { 
      cwd: talkDir, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Copy the built output to dist/(talk-dir)/
    const srcDist = join(talkDir, 'dist');
    const destDist = join('dist', talk);
    
    if (existsSync(srcDist)) {
      cpSync(srcDist, destDist, { recursive: true });
      console.log(`Copied ${talk}/dist to dist/${talk}`);
    } else {
      console.error(`Warning: No dist directory found for ${talk}`);
    }
  } catch (error) {
    console.error(`Error building ${talk}:`, error.message);
    process.exit(1);
  }
}

// Generate the root index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Talks</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      transition: background 0.2s;
    }
    li:hover {
      background: #e8e8e8;
    }
    a {
      color: #0066cc;
      text-decoration: none;
      font-size: 1.1em;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Talks</h1>
  <ul>
${talks.map(talk => `    <li><a href="/${talk}/">${talk}</a></li>`).join('\n')}
  </ul>
</body>
</html>
`;

writeFileSync('dist/index.html', indexHtml);
console.log('\nGenerated dist/index.html');
console.log('Build complete!');
