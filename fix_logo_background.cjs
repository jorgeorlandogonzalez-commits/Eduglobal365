const fs = require('fs');

console.log("Fixing LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');

// 1. Fix Navbar Logo
const navLogoRegex = /<div className="flex items-center gap-2">\s*<img src="\/logo\.png" alt="EduGlobal365 Logo" className="h-16 md:h-20 object-contain drop-shadow-lg" \/>\s*<\/div>/;
const navLogoReplacement = `<div className="flex items-center justify-center bg-white rounded-full px-5 py-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img src="/logo.png" alt="EduGlobal365 Logo" className="h-10 md:h-12 object-contain mix-blend-multiply" />
          </div>`;
landing = landing.replace(navLogoRegex, navLogoReplacement);

// 2. Fix Hero Banner Logo
const heroRegex = /<motion\.img[\s\S]*?className="h-32 md:h-48 lg:h-56 object-contain mb-8 drop-shadow-\[0_10px_30px_rgba\(255,255,255,0\.1\)\]"[\s\S]*?\/>/;
const heroReplacement = `<motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-10 bg-white px-8 py-5 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-blue-100"
          >
            <img 
              src="/logo.png" 
              alt="EduGlobal 365 Smart Virtual Platform" 
              className="h-20 md:h-32 lg:h-40 object-contain mix-blend-multiply" 
            />
          </motion.div>`;
landing = landing.replace(heroRegex, heroReplacement);

fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Fixing App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
const appLogoRegex = /<img src="\/logo\.png" alt="EduGlobal365" className="h-14 md:h-16 object-contain mr-2 drop-shadow-sm" \/>/;
const appLogoReplacement = `<div className="bg-white rounded-xl px-2 py-1 mr-3 shadow-sm border border-slate-200">
            <img src="/logo.png" alt="EduGlobal365" className="h-8 md:h-10 object-contain mix-blend-multiply" />
          </div>`;
app = app.replace(appLogoRegex, appLogoReplacement);

fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("Done");
