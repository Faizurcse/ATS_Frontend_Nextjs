const fs = require('fs');
const path = require('path');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix @/components/ui/ imports to relative paths
    const uiImportRegex = /from ["']@\/components\/ui\/([^"']+)["']/g;
    content = content.replace(uiImportRegex, (match, component) => {
      modified = true;
      return `from "../../components/ui/${component}"`;
    });

    // Fix @/hooks/ imports to relative paths
    const hooksImportRegex = /from ["']@\/hooks\/([^"']+)["']/g;
    content = content.replace(hooksImportRegex, (match, hook) => {
      modified = true;
      return `from "../../hooks/${hook}"`;
    });

    // Fix @/lib/ imports to relative paths
    const libImportRegex = /from ["']@\/lib\/([^"']+)["']/g;
    content = content.replace(libImportRegex, (match, lib) => {
      modified = true;
      return `from "../../lib/${lib}"`;
    });

    // Fix @/PythonApi imports
    const pythonApiRegex = /from ["']@\/PythonApi["']/g;
    content = content.replace(pythonApiRegex, () => {
      modified = true;
      return `from "../../PythonApi"`;
    });

    // Fix @/BaseUrlApi imports
    const baseUrlApiRegex = /from ["']@\/BaseUrlApi["']/g;
    content = content.replace(baseUrlApiRegex, () => {
      modified = true;
      return `from "../../BaseUrlApi"`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing imports in ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and fix all .tsx files in app/components
function fixAllImports(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixedCount += fixAllImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixImportsInFile(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Main execution
console.log('🔧 Starting import path fixes...');
const appComponentsDir = path.join(__dirname, '..', 'app', 'components');
const fixedCount = fixAllImports(appComponentsDir);
console.log(`🎉 Fixed imports in ${fixedCount} files!`);
