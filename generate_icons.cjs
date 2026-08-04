const fs = require('fs');

// A simple 1x1 transparent PNG
const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

// A simple SVG
const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="transparent"/></svg>';

fs.writeFileSync('public/favicon.ico', pngBuffer);
fs.writeFileSync('public/apple-touch-icon.png', pngBuffer);
fs.writeFileSync('public/pwa-192x192.png', pngBuffer);
fs.writeFileSync('public/pwa-512x512.png', pngBuffer);
fs.writeFileSync('public/masked-icon.svg', svgContent);
