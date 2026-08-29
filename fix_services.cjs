const fs = require('fs');
let payment = fs.readFileSync('services/paymentService.ts', 'utf-8');
payment = payment.replace(/auth\.currentUser/g, 'auth?.currentUser');
fs.writeFileSync('services/paymentService.ts', payment, 'utf-8');

let privileged = fs.readFileSync('services/privilegedAccessService.ts', 'utf-8');
privileged = privileged.replace(/auth\.currentUser/g, 'auth?.currentUser');
fs.writeFileSync('services/privilegedAccessService.ts', privileged, 'utf-8');
