const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'compare', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'register', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'reset-password', 'page.tsx'),
];

for (const filePath of filesToUpdate) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('export const dynamic')) {
      content = "export const dynamic = 'force-dynamic';\n" + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added force-dynamic export to: ${filePath}`);
    }
  }
}
