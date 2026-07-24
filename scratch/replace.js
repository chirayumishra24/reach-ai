const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const filesToReplace = [
  'src/lib/storage.js',
  'src/lib/crawlers/youtube.js',
  'src/lib/crawlers/twitter.js',
  'src/lib/crawlers/trends.js',
  'src/lib/crawlers/reddit.js',
  'src/lib/crawlers/news.js',
  'src/lib/crawlers/instagram.js',
  'src/lib/ai/writer-agent.js',
  'src/lib/ai/seo-agent.js',
  'src/lib/ai/research-agent.js',
  'src/lib/ai/geo-intel.js',
  'src/lib/ai/editor-agent.js',
  'src/lib/ai/ai-client.js',
  'src/app/layout.js',
  'plan.md',
  'docs/vercel-postgres-setup.md',
  'design.md'
];

filesToReplace.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent file: ${relPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replacements:
  // 1. SkilizeeAI -> Reach.ai
  // 2. Skilizee Academy -> Reach.ai Workspace
  // 3. Skilizee Edu -> Reach.ai
  // 4. Skilizee -> Reach.ai
  // 5. skilizee -> reach
  
  let newContent = content
    .replace(/SkilizeeAI/g, 'Reach.ai')
    .replace(/Skilizee Academy/g, 'Reach.ai Workspace')
    .replace(/Skilizee Edu/g, 'Reach.ai')
    .replace(/Skilizee/g, 'Reach.ai')
    .replace(/skilizee/g, 'reach');
  
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated: ${relPath}`);
  } else {
    console.log(`No changes needed in: ${relPath}`);
  }
});
