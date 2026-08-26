const fs = require('fs');

console.log("Patching LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');

// 1. Navbar resize
// Original: <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
landing = landing.replace(
  /<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">/,
  '<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">'
);
// Original: <img src="/logo.png" alt="EduGlobal365 Logo" className="h-10 object-contain" />
landing = landing.replace(
  /<img src="\/logo.png" alt="EduGlobal365 Logo" className="h-10 object-contain" \/>/,
  '<img src="/logo.png" alt="EduGlobal365 Logo" className="h-16 md:h-20 object-contain drop-shadow-lg" />'
);

// 2. Hero Section Banner addition
// Original: 
// <div className="max-w-4xl mx-auto">
//   <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-sm font-bold mb-6 border border-blue-700/50">
const heroRegex = /<div className="max-w-4xl mx-auto">\s*<span className="inline-block py-1 px-3 rounded-full bg-blue-900\/50/;
const heroReplacement = `<div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.img
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            src="/logo.png"
            alt="EduGlobal 365 Smart Virtual Platform"
            className="h-32 md:h-48 lg:h-56 object-contain mb-8 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
          />
          <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50`;
landing = landing.replace(heroRegex, heroReplacement);

fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Patching App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
// Original: <img src="/logo.png" alt="EduGlobal365" className="h-10 object-contain mr-2" />
app = app.replace(
  /<img src="\/logo.png" alt="EduGlobal365" className="h-10 object-contain mr-2" \/>/,
  '<img src="/logo.png" alt="EduGlobal365" className="h-14 md:h-16 object-contain mr-2 drop-shadow-sm" />'
);
fs.writeFileSync('App.tsx', app, 'utf-8');

console.log("Done");
