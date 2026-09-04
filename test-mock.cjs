const { getFirestore } = require('firebase-admin/firestore');

const admin = {
  firestore: (opts) => opts && opts.databaseId ? getFirestore(undefined, opts.databaseId) : getFirestore()
};

try {
  admin.firestore({ databaseId: 'ai-studio-eduglobal365' });
  console.log('Success with databaseId');
} catch (e) {
  console.error('Error with databaseId:', e.message);
}

try {
  admin.firestore();
  console.log('Success without args');
} catch (e) {
  console.error('Error without args:', e.message);
}
