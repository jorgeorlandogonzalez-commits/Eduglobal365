const { getFirestore } = require('firebase-admin/firestore');
try {
  getFirestore(undefined, 'my-db');
  console.log('Passed undefined, my-db');
} catch (e) {
  console.error(e.message);
}
