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
    content = content.replace(/import Navbar from '\.\.\/\.\.\/\.\.\/\.\.\/components\/Navbar';/g, "import Navbar from '@/components/Navbar';");
    content = content.replace(/import Navbar from '\.\.\/\.\.\/\.\.\/components\/Navbar';/g, "import Navbar from '@/components/Navbar';");
    content = content.replace(/import Navbar from '\.\.\/\.\.\/components\/Navbar';/g, "import Navbar from '@/components/Navbar';");
    
    content = content.replace(/import \{ useAuth \} from '\.\.\/\.\.\/\.\.\/\.\.\/context\/AuthContext';/g, "import { useAuth } from '@/context/AuthContext';");
    content = content.replace(/import \{ useAuth \} from '\.\.\/\.\.\/\.\.\/context\/AuthContext';/g, "import { useAuth } from '@/context/AuthContext';");
    content = content.replace(/import \{ useAuth \} from '\.\.\/\.\.\/context\/AuthContext';/g, "import { useAuth } from '@/context/AuthContext';");

    content = content.replace(/import \{ useLanguage \} from '\.\.\/\.\.\/\.\.\/\.\.\/context\/LanguageContext';/g, "import { useLanguage } from '@/context/LanguageContext';");
    content = content.replace(/import \{ useLanguage \} from '\.\.\/\.\.\/\.\.\/context\/LanguageContext';/g, "import { useLanguage } from '@/context/LanguageContext';");
    content = content.replace(/import \{ useLanguage \} from '\.\.\/\.\.\/context\/LanguageContext';/g, "import { useLanguage } from '@/context/LanguageContext';");

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated imports to @/ alias for: ${p}`);
  }
}
