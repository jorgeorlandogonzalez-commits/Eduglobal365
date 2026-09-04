const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const admin = {
  get apps() { return getApps(); },
  initializeApp: (opts) => initializeApp(opts),
  credential: { cert },
  firestore: (opts) => opts && opts.databaseId ? getFirestore(undefined, opts.databaseId) : getFirestore()
};

console.log(admin.apps.length);
