const fs = require('fs');

console.log("Fixing LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');

const navLogoRegex = /<img src="\/logo\.png" alt="EduGlobal365 Logo" className="h-10 md:h-12 w-auto object-cover" \/>/;
const navLogoReplacement = `<img src="/logo.png" alt="EduGlobal365 Logo" className="h-16 md:h-20 w-auto object-cover scale-[1.35] hover:scale-[1.4] transition-transform duration-300" />`;
landing = landing.replace(navLogoRegex, navLogoReplacement);

fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Fixing App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
const appLogoRegex = /<img src="\/logo\.png" alt="EduGlobal365" className="h-8 md:h-10 w-auto object-cover" \/>/;
const appLogoReplacement = `<img src="/logo.png" alt="EduGlobal365" className="h-12 md:h-14 w-auto object-cover scale-[1.35]" />`;
app = app.replace(appLogoRegex, appLogoReplacement);

fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("Done");
