const fs = require('fs');

console.log("Fixing LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');

const navLogoRegex = /<div className="flex items-center justify-center bg-white rounded-full px-5 py-2 shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\]">\s*<img src="\/logo\.png" alt="EduGlobal365 Logo" className="h-10 md:h-12 object-contain mix-blend-multiply" \/>\s*<\/div>/;
const navLogoReplacement = `<div className="flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img src="/logo.png" alt="EduGlobal365 Logo" className="h-10 md:h-12 w-auto object-cover" />
          </div>`;
landing = landing.replace(navLogoRegex, navLogoReplacement);
fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Fixing App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
const appLogoRegex = /<div className="bg-white rounded-xl px-2 py-1 mr-3 shadow-sm border border-slate-200">\s*<img src="\/logo\.png" alt="EduGlobal365" className="h-8 md:h-10 object-contain mix-blend-multiply" \/>\s*<\/div>/;
const appLogoReplacement = `<div className="rounded-full overflow-hidden mr-3 shadow-sm border border-slate-200/50">
            <img src="/logo.png" alt="EduGlobal365" className="h-8 md:h-10 w-auto object-cover" />
          </div>`;
app = app.replace(appLogoRegex, appLogoReplacement);
fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("Done");
