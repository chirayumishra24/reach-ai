const fs = require('fs');
const path = require('path');

const fullPath = path.resolve(__dirname, '../design.md');
if (fs.existsSync(fullPath)) {
  let content = fs.readFileSync(fullPath, 'utf16le');
  
  let newContent = content
    .replace(/SkilizeeAI/g, 'Reach.ai')
    .replace(/Skilizee Academy/g, 'Reach.ai Workspace')
    .replace(/Skilizee Edu/g, 'Reach.ai')
    .replace(/Skilizee/g, 'Reach.ai')
    .replace(/skilizee/g, 'reach');
    
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf16le');
    console.log('Updated design.md');
  } else {
    console.log('No changes in design.md');
  }
} else {
  console.log('design.md not found');
}
