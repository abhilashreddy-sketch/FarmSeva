const fs = require('fs');
const path = require('path');

const pagesToFix = [
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'products', '[slug]', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'cart', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'compare', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'seller', 'marketplace', 'page.tsx'),
  path.join(__dirname, 'apps', 'web', 'src', 'app', 'admin', 'marketplace', 'page.tsx'),
];

for (const p of pagesToFix) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/\.map\(\(product\)/g, '.map((product: any)');
    content = content.replace(/\.map\(\(cat\)/g, '.map((cat: any)');
    content = content.replace(/\.map\(\(item\)/g, '.map((item: any)');
    content = content.replace(/\.map\(\(p\)/g, '.map((p: any)');
    content = content.replace(/\.map\(\(l\)/g, '.map((l: any)');
    content = content.replace(/\.map\(\(v\)/g, '.map((v: any)');
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated explicit types for: ${p}`);
  }
}
