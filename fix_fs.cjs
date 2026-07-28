const fs = require('fs');

let code = fs.readFileSync('services/firestoreService.ts', 'utf8');

// replace occurrences of doc(db, ...) with db ? doc(db, ...) : null and handle appropriately?
// Instead, just wrap the body of functions in `if (!db) return ...;`
