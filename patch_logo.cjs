const fs = require('fs');

console.log("Patching LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');

// Replace Navbar logo
const navLogoRegex = /<div className="flex items-center gap-2">\s*<span className="text-2xl">🎒<\/span>\s*<span className="font-black tracking-tight">EduGlobal365<\/span>\s*<\/div>/;
const navLogoReplacement = `<div className="flex items-center gap-2">
            <img src="/logo.png" alt="EduGlobal365 Logo" className="h-10 object-contain" />
          </div>`;
landing = landing.replace(navLogoRegex, navLogoReplacement);

// Replace Footer text logo
const footerTextRegex = /<p>© 2026 EduGlobal365 SAS BIC — Educación de élite para todos los colombianos\.<\/p>/;
const footerTextReplacement = `<div className="flex items-center gap-3">
            <img src="/logo.png" alt="EduGlobal365" className="h-8 object-contain grayscale opacity-70" />
            <p>© 2026 EduGlobal365 SAS BIC — Educación de élite para todos los colombianos.</p>
          </div>`;
landing = landing.replace(footerTextRegex, footerTextReplacement);

fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Patching App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
const headerIconRegex = /<div className="bg-blue-600 dark:bg-blue-500 p-1\.5 rounded-lg text-white">\s*<svg[\s\S]*?<\/svg>\s*<\/div>\s*<div>\s*<h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">\{APP_NAME\}<\/h1>/;
const headerIconReplacement = `<img src="/logo.png" alt="EduGlobal365" className="h-10 object-contain mr-2" />
          <div>`;
app = app.replace(headerIconRegex, headerIconReplacement);
fs.writeFileSync('App.tsx', app, 'utf-8');

console.log("Patching index.html...");
let html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('rel="icon"')) {
  html = html.replace('</title>', '</title>\n    <link rel="icon" type="image/png" href="/logo.png" />');
}
fs.writeFileSync('index.html', html, 'utf-8');

console.log("Done");
