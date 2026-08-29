const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf-8');
app = app.replace(/auth\.currentUser/g, 'auth?.currentUser');
fs.writeFileSync('App.tsx', app, 'utf-8');
